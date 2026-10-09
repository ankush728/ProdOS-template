"""Delivery-status report for one Jira epic, built from saved Rovo MCP payloads.

Inputs are the JSON files the Atlassian Rovo MCP writes when a result is large
(or that the caller saves itself). Nothing here calls Jira; it only reads files.

Usage:
  python jira_status.py --epic PROJ-123 --search search.json \
      [--changelogs DIR] [--prs prs.json] [--today YYYY-MM-DD] [--out report.md]

  --search      searchJiraIssuesUsingJql result for the epic's children
  --changelogs  directory of getJiraIssue(expand=changelog) results, one per issue
  --prs         getTeamworkGraphObject result(s) for linked pull requests; a file
                or a directory of files
"""

import argparse
import datetime as dt
import json
import pathlib
import re
import sys

DONE = {"deployed to prod", "done", "canceled", "cancelled", "closed", "released"}
REVIEW = {"in code review", "code review"}
CHANGES = {"changes requested"}
DEV = {"in development", "subtask in progress", "in progress", "in qa testing", "in qa", "dev verifying on qa",
       "product review", "ready for release", "ready to release"}
NOT_STARTED = {"ticket created", "to do", "selected for development", "needs refinement",
               "ready for dev", "ready for development", "backlog"}


def load(path):
    return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))


def nodes(payload):
    if isinstance(payload, dict):
        if "issues" in payload and isinstance(payload["issues"], dict):
            return payload["issues"].get("nodes", [])
        if "issues" in payload and isinstance(payload["issues"], list):
            return payload["issues"]
        if "key" in payload:
            return [payload]
    if isinstance(payload, list):
        return payload
    return []


def name(v):
    if isinstance(v, dict):
        return v.get("name") or v.get("displayName") or v.get("key") or ""
    return v or ""


def parse_ts(s):
    if not s:
        return None
    s = s.replace("Z", "+00:00")
    s = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", s)
    try:
        return dt.datetime.fromisoformat(s)
    except ValueError:
        return dt.datetime.fromisoformat(s[:19])


def days(a, b):
    if not a or not b:
        return None
    a = a.replace(tzinfo=None)
    b = b.replace(tzinfo=None)
    return round((b - a).total_seconds() / 86400, 1)


def status_history(issue):
    hist = (issue.get("changelog") or {}).get("histories", [])
    out = []
    for h in hist:
        for it in h.get("items", []):
            if it.get("field") == "status":
                out.append((parse_ts(h.get("created")), (it.get("fromString") or "").lower(),
                            (it.get("toString") or "").lower(), (h.get("author") or {}).get("displayName")))
    return sorted(out, key=lambda x: x[0])


def review_metrics(hist, now):
    """Cumulative days in review, rounds sent back, days to first reviewer action."""
    in_review = 0.0
    rounds = 0
    first_review_entry = None
    first_feedback = None
    entered = None
    for ts, frm, to, who in hist:
        if to in REVIEW:
            entered = ts
            first_review_entry = first_review_entry or ts
        elif frm in REVIEW and entered:
            in_review += days(entered, ts) or 0
            entered = None
            if first_feedback is None:
                first_feedback = ts
        if to in CHANGES:
            rounds += 1
    if entered:
        in_review += days(entered, now) or 0
    wait = days(first_review_entry, first_feedback or now) if first_review_entry else None
    return round(in_review, 1), rounds, first_review_entry, wait, first_feedback is not None


def load_prs(arg):
    if not arg:
        return {}
    p = pathlib.Path(arg)
    files = sorted(p.glob("*.json")) + sorted(p.glob("*.txt")) if p.is_dir() else [p]
    prs = {}
    for f in files:
        d = load(f)
        objs = (((d.get("data") or {}).get("data") or {}).get("objects")) or d.get("objects") or []
        for o in objs:
            raw = o.get("raw") or {}
            title = raw.get("title") or raw.get("displayName") or ""
            m = re.match(r"\s*([A-Z][A-Z0-9]+-\d+)", title)
            if not m:
                continue
            humans = [r for r in raw.get("reviewers", []) if "[bot]" not in name(r.get("user"))
                      and name(r.get("user")) != name(raw.get("author"))]
            prs.setdefault(m.group(1), []).append({
                "id": raw.get("displayId") or raw.get("pullRequestId"),
                "url": raw.get("url"),
                "state": (raw.get("pullRequestStatus") or "").upper(),
                "approved": sum(1 for r in humans if r.get("approvalStatus") == "APPROVED"),
                "reviewers": len(humans),
                "updated": (raw.get("lastUpdatedAt") or "")[:10],
            })
    return prs


def bucket(status):
    s = status.lower()
    if s in DONE:
        return "done"
    if s in REVIEW or s in CHANGES:
        return "review"
    if s in DEV:
        return "dev"
    if s in NOT_STARTED:
        return "not started"
    return "other"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--epic", required=True)
    ap.add_argument("--search", required=True)
    ap.add_argument("--changelogs")
    ap.add_argument("--prs")
    ap.add_argument("--today")
    ap.add_argument("--site", default="https://<your-site>.atlassian.net",
                    help="Atlassian site URL used to build ticket links")
    ap.add_argument("--out")
    a = ap.parse_args()

    now = dt.datetime.fromisoformat(a.today) if a.today else dt.datetime.now()
    issues = {}
    for n in nodes(load(a.search)):
        f = n.get("fields", n)
        key = n.get("key")
        if not key:
            continue
        issues[key] = {
            "key": key,
            "summary": f.get("summary", ""),
            "type": name(f.get("issuetype")),
            "status": name(f.get("status")),
            "assignee": name(f.get("assignee")) or "unassigned",
            "created": parse_ts(f.get("created")),
            "resolved": parse_ts(f.get("resolutiondate")),
            "parent": name(f.get("parent")),
            "hist": [],
        }

    if a.changelogs:
        for fp in pathlib.Path(a.changelogs).glob("*"):
            try:
                for n in nodes(load(fp)):
                    if n.get("key") in issues:
                        issues[n["key"]]["hist"] = status_history(n)
            except (json.JSONDecodeError, UnicodeDecodeError):
                print(f"skipped unreadable changelog file {fp.name}", file=sys.stderr)

    prs = load_prs(a.prs)
    epic = issues.pop(a.epic, None)
    # Keep the epic's children and their sub-tasks; a text search can return unrelated tickets.
    children = {k for k, i in issues.items() if i["parent"] == a.epic}
    rows = [i for i in issues.values()
            if i["type"].lower() != "epic" and (i["parent"] == a.epic or i["parent"] in children)]
    for i in rows:
        i["bucket"] = bucket(i["status"])
        i["age"] = days(i["created"], now)
        if i["hist"]:
            last = i["hist"][-1][0]
            i["in_status"] = days(last, now)
            i["review_days"], i["rounds"], i["review_start"], i["first_wait"], i["reviewed"] = review_metrics(i["hist"], now)
        else:
            i["in_status"] = i["review_days"] = i["rounds"] = i["first_wait"] = None
            i["review_start"] = None
            i["reviewed"] = False
        i["prs"] = prs.get(i["key"], [])

    counts = {}
    for i in rows:
        counts[i["bucket"]] = counts.get(i["bucket"], 0) + 1
    open_rows = [i for i in rows if i["bucket"] != "done"]
    order = {"review": 0, "dev": 1, "not started": 2, "other": 3}
    open_rows.sort(key=lambda i: (order.get(i["bucket"], 9), -(i["review_days"] or 0)))
    shipped = sorted([i for i in rows if i["status"].lower() == "deployed to prod"],
                     key=lambda i: i["resolved"] or now)
    canceled = [i for i in rows if i["status"].lower() in {"canceled", "cancelled"}]

    def link(k):
        return f"[{k}]({a.site}/browse/{k})"

    def fmt(x):
        return "—" if x is None else (f"{x:g}" if isinstance(x, float) else str(x))

    L = []
    title = epic["summary"] if epic else ""
    L.append(f"# Jira status: {a.epic} {title}".rstrip())
    L.append("")
    L.append(f"**As of:** {now:%Y-%m-%d} · **Epic status:** {epic['status'] if epic else 'not in result'}"
             + (f" · **Epic age:** {fmt(days(epic['created'], now))} days" if epic and epic['created'] else ""))
    L.append("**Child tickets:** " + " · ".join(f"{v} {k}" for k, v in sorted(counts.items())))
    L.append("")
    blocked = [i for i in open_rows if i["bucket"] == "review"]
    if blocked:
        worst = max(blocked, key=lambda i: i["review_days"] or 0)
        L.append("## Headline")
        L.append(f"- **{len(blocked)} ticket(s) in review or sent back.** Longest: {link(worst['key'])} at "
                 f"{fmt(worst['review_days'])} days in review, {fmt(worst['rounds'])} round(s) of changes"
                 + (f", {fmt(worst['first_wait'])} days to first reviewer action." if worst['first_wait'] is not None else "."))
    ns = [i for i in open_rows if i["bucket"] == "not started"]
    if ns:
        L.append(f"- **{len(ns)} open ticket(s) not started**, {sum(1 for i in ns if i['assignee']=='unassigned')} unassigned.")
    L.append("")
    L.append("## Open work")
    L.append("| Ticket | Status | Assignee | Days in status | Days in review (total) | Rounds sent back | Days to first review | PRs | Summary |")
    L.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for i in open_rows:
        pr = "; ".join(f"[{p['id']}]({p['url']}) {p['state'].lower()} {p['approved']}/{p['reviewers']} approved"
                       for p in i["prs"] if p["state"] != "DECLINED") or "—"
        L.append(f"| {link(i['key'])} | {i['status']} | {i['assignee']} | {fmt(i['in_status'])} | "
                 f"{fmt(i['review_days'])} | {fmt(i['rounds'])} | {fmt(i['first_wait'])} | {pr} | {i['summary'][:80]} |")
    L.append("")
    if shipped:
        L.append("## Shipped")
        for i in shipped:
            L.append(f"- {link(i['key'])} {i['summary'][:80]} — {i['resolved']:%Y-%m-%d}" if i["resolved"] else
                     f"- {link(i['key'])} {i['summary'][:80]}")
        L.append("")
    if canceled:
        L.append(f"**Canceled:** " + ", ".join(link(i["key"]) for i in canceled))
        L.append("")
    missing = [i["key"] for i in open_rows if not i["hist"]]
    if missing:
        L.append(f"⚠️ No changelog loaded for {', '.join(missing)}, so review timings are blank for those.")
    L.append("Review days count time in an IN CODE REVIEW status. Days to first review = entering review to the first move out of it.")

    text = "\n".join(L) + "\n"
    if a.out:
        pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        pathlib.Path(a.out).write_text(text, encoding="utf-8")
        print(f"wrote {a.out}")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
