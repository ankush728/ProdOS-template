"""Morning Jira tracker: one living file, updated each run.

Each run merges the latest Jira state into a state file, appends a dated entry to a
ticket's trail when its status changes, and drops tickets once they are released
(Deployed to Prod / Done) or canceled. The markdown is re-rendered from the state.

Reads saved Rovo MCP search results (nothing here calls Jira):
  --watch     JQL: (parent in (<epics>) OR key in (<epics + tickets>))
  --activity  JQL: project = <PROJECT-KEY> AND status CHANGED DURING ("<day>", "<day+1>")

Usage:
  python jira_morning.py --watchlist skills/JiraStatus/watchlist.md \
      --watch p1.json [p2.json ...] --activity a1.json [...] --day YYYY-MM-DD \
      --state output/jira-status/morning_state.json --out output/jira-status/morning.md \
      [--today YYYY-MM-DD]
"""

import argparse
import datetime as dt
import json
import os
import pathlib
import re

RELEASED = {"deployed to prod", "done", "closed", "released"}
CANCELED = {"canceled", "cancelled"}
REVIEW = {"in code review", "code review", "changes requested"}
DEV = {"in development", "subtask in progress", "in progress"}
QA = {"in qa testing", "in qa", "qa", "dev verifying on qa", "product review", "ready for release", "ready to release"}
NOT_STARTED = {"ticket created", "to do", "selected for development", "needs refinement", "ready for dev",
               "ready for development", "backlog"}
SITE = "https://<your-site>.atlassian.net"  # set to your Atlassian site URL


def load(p):
    return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))


def save(path, text):
    """Write via a temp file and rename, so a failed write never truncates the target."""
    p = pathlib.Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_suffix(p.suffix + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, p)


def nodes(d):
    if isinstance(d, dict) and isinstance(d.get("issues"), dict):
        return d["issues"].get("nodes", [])
    if isinstance(d, dict) and isinstance(d.get("issues"), list):
        return d["issues"]
    return d if isinstance(d, list) else []


def name(v):
    if isinstance(v, dict):
        return v.get("name") or v.get("displayName") or v.get("key") or ""
    return v or ""


def flat(n):
    f = n.get("fields", n)
    return {
        "key": n.get("key"),
        "summary": f.get("summary", ""),
        "type": name(f.get("issuetype")),
        "status": name(f.get("status")),
        "assignee": name(f.get("assignee")) or "unassigned",
        "parent": name(f.get("parent")),
        "priority": name(f.get("priority")),
    }


def bucket(s):
    s = s.lower()
    if s in RELEASED:
        return "released"
    if s in CANCELED:
        return "canceled"
    if s in REVIEW:
        return "review"
    if s in DEV:
        return "dev"
    if s in QA:
        return "qa"
    if s in NOT_STARTED:
        return "not started"
    return "other"


def watchlist(path):
    rows = []
    for line in pathlib.Path(path).read_text(encoding="utf-8").splitlines():
        m = re.match(r"\|\s*(.+?)\s*\|\s*([A-Z][A-Z0-9]+-\d+)\s*\|\s*(epic|ticket)\s*\|", line)
        if m:
            rows.append({"item": m.group(1), "key": m.group(2), "kind": m.group(3)})
    return rows


def link(k):
    return f"[{k}]({SITE}/browse/{k})"


def short(d):
    return d[5:] if d and len(d) == 10 else d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--watchlist", required=True)
    ap.add_argument("--watch", required=True, nargs="+", help="one file per result page")
    ap.add_argument("--activity", required=True, nargs="+", help="one file per result page")
    ap.add_argument("--day", required=True, help="the business day whose status changes are being merged")
    ap.add_argument("--state", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--today")
    a = ap.parse_args()

    today = a.today or dt.date.today().isoformat()
    wl = watchlist(a.watchlist)
    watched = {i["key"]: i for f in a.watch for i in map(flat, nodes(load(f))) if i["key"]}
    moved = {i["key"]: i for f in a.activity for i in map(flat, nodes(load(f))) if i["key"]}

    state = load(a.state) if pathlib.Path(a.state).exists() else {"tickets": {}, "runs": []}
    tickets = state["tickets"]

    # Which watched item each ticket belongs to
    item_of = {}
    for w in wl:
        if w["kind"] == "ticket":
            item_of[w["key"]] = w["key"]
            continue
        kids = {k for k, i in watched.items() if i["parent"] == w["key"]}
        for k in kids | {k for k, i in watched.items() if i["parent"] in kids}:
            item_of[k] = w["key"]
    item_name = {w["key"]: w["item"] for w in wl}

    # Candidates: everything that moved, plus watched tickets already in flight
    incoming = dict(moved)
    for k, i in watched.items():
        if k in item_of and bucket(i["status"]) in {"review", "dev", "qa", "other"}:
            incoming.setdefault(k, i)

    released_today = []
    for k, i in incoming.items():
        b = bucket(i["status"])
        prev = tickets.get(k)
        if b in {"released", "canceled"}:
            if prev:
                released_today.append((k, prev["summary"], i["status"]))
                del tickets[k]
            continue
        entry = {"date": a.day if k in moved else today, "status": i["status"], "assignee": i["assignee"]}
        if k not in moved:
            entry["as_of"] = True  # status observed, change date unknown
        if prev is None:
            tickets[k] = {**{f: i[f] for f in ("summary", "type", "priority", "assignee", "status")},
                          "item": item_name.get(item_of.get(k), ""), "first_seen": entry["date"], "trail": [entry]}
        else:
            prev.update({f: i[f] for f in ("summary", "type", "priority", "assignee")})
            prev["item"] = item_name.get(item_of.get(k), prev.get("item", ""))
            if i["status"] != prev["status"]:
                prev["trail"].append(entry)
                prev["status"] = i["status"]

    # Watched tickets released since the last run but absent from today's activity
    for k in list(tickets):
        w = watched.get(k)
        if w and bucket(w["status"]) in {"released", "canceled"}:
            released_today.append((k, tickets[k]["summary"], w["status"]))
            del tickets[k]

    state["runs"] = (state.get("runs", []) + [{"today": today, "day": a.day, "moved": len(moved),
                                                 "released": [r[0] for r in released_today]}])[-30:]
    save(a.state, json.dumps(state, indent=1, ensure_ascii=False))

    # ---- Render
    L = ["# Jira morning tracker", "",
         f"**Last updated:** {today} (status changes through {a.day}). "
         "Tickets leave this file once they are deployed to production or canceled.", ""]

    L.append("## Watched roadmap items")
    L.append("| Item | Key | Status | Done | QA / ready | Review | Dev | Not started | Other |")
    L.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for w in wl:
        head = watched.get(w["key"])
        if w["kind"] == "ticket":
            kids = [head] if head else []
        else:
            kids = [i for k, i in watched.items()
                    if item_of.get(k) == w["key"] and k != w["key"] and i["type"].lower() != "epic"]
        c = {"released": 0, "canceled": 0, "qa": 0, "review": 0, "dev": 0, "not started": 0, "other": 0}
        for i in kids:
            c[bucket(i["status"])] += 1
        L.append(f"| {w['item']} | {link(w['key'])} | {head['status'] if head else 'not found'} | "
                 f"{c['released']} | {c['qa']} | {c['review']} | {c['dev']} | {c['not started']} | {c['other']} |")
    L.append("")

    if released_today:
        L.append(f"## Released or canceled since last run ({len(released_today)}), removed")
        for k, s, st in released_today:
            L.append(f"- {link(k)} {s[:90]} ({st})")
        L.append("")

    L.append("## Open tickets being tracked")
    L.append("By current assignee. Trail = status on each date it changed. 🐞 bug · ★ watched item · "
             f"**bold** date = changed on {a.day}.")
    L.append("")
    by = {}
    for k, t in tickets.items():
        by.setdefault(t["assignee"], []).append((k, t))
    order = {"review": 0, "qa": 1, "dev": 2, "other": 3, "not started": 4}
    for person in sorted(by, key=lambda p: (p == "unassigned", p)):
        rows = sorted(by[person], key=lambda kt: (kt[1]["type"].lower() != "bug",
                                                   order.get(bucket(kt[1]["status"]), 9), kt[0]))
        L.append(f"**{person}** ({len(rows)})")
        for k, t in rows:
            tag = "🐞 " if t["type"].lower() == "bug" else ""
            star = " ★" if t.get("item") else ""
            pr = f" · {t['priority']}" if t["type"].lower() == "bug" and t.get("priority") else ""
            def stamp(e):
                if e.get("as_of"):
                    return f"(as of {short(e['date'])})"
                return f"**{short(e['date'])}**" if e["date"] == a.day else short(e["date"])
            trail = " → ".join(f"{stamp(e)} {e['status'].lower()}" for e in t["trail"])
            L.append(f"- {tag}{link(k)}{star}{pr} · {t['summary'][:85]} · {trail}")
        L.append("")

    bugs = [(k, t) for k, t in tickets.items() if t["type"].lower() == "bug"]
    hi = [b for b in bugs if b[1].get("priority") in {"Highest", "High"}]
    L.append(f"**Open bugs tracked:** {len(bugs)} ({len(hi)} High or Highest).")
    L.append("")
    L.append("Limits: grouped by current assignee, not by who made the change; work without a status "
             "change (comments, commits, review feedback) does not appear.")

    save(a.out, "\n".join(L) + "\n")
    print(f"wrote {a.out} · tracking {len(tickets)} · removed {len(released_today)}")


if __name__ == "__main__":
    main()
