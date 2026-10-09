#!/usr/bin/env python3
"""
VOC Reddit Daily Scan
Pulls /new from r/Firefighting, r/EMS, r/VolunteerFireDept, triages posts into
Hot/Warm/Cold by PSTrax outcome-area pain signal, writes a markdown digest.
"""

import json
import os
import re
import sys
import time
import datetime as dt
from pathlib import Path
from typing import Optional

import requests

# ROOT is derived from the script's location so this works across
# different session mounts (e.g. /sessions/<random-name>/mnt/...).
ROOT = Path(__file__).resolve().parent.parent
STATE_FILE = ROOT / "state" / "voc" / "seen_post_ids.json"
OUTPUT_FILE = ROOT / "output" / "voc" / "voc_signals.md"
ENV_FILE = ROOT / ".env"

SUBREDDITS = ["Firefighting", "EMS", "VolunteerFireDept"]
LIMIT_PER_SUB = 50
TOP_COMMENTS = 5
LOOKBACK_HOURS = 24

# Competitor list per task spec.
# Two-bucket approach:
#   COMPETITORS_EXACT  — short / ambiguous tokens (≤2 words, common substrings).
#                        Matched with \b word boundaries so "eso" doesn't fire
#                        inside "resource", "resolver", etc.
#   COMPETITORS_PHRASE — multi-word or distinctive tokens matched as plain
#                        lowercase substrings (they're already specific enough).
#
# Removed standalone "Vector" — too common in fire/EMS contexts
# (e.g. "vector of attack", "vector-borne disease"). "Vector Solutions" is retained.
COMPETITORS_EXACT = [
    "PSTrax", "ESO", "Adashi", "Aladtec", "CrewSense",
]
COMPETITORS_PHRASE = [
    "Vector Solutions", "IamResponding", "I am Responding",
    "FireRMS", "Emergency Reporting", "ImageTrend",
    "Operative IQ", "OperativeIQ",
]
COMPETITORS_LC = [c.lower() for c in COMPETITORS_EXACT + COMPETITORS_PHRASE]
# Keep a set for the exact-match tokens (lowercased) so contains_competitor
# knows which bucket each hit came from.
_EXACT_LC = {c.lower() for c in COMPETITORS_EXACT}
_PHRASE_LC = {c.lower() for c in COMPETITORS_PHRASE}

# Outcome-area keyword maps. Each keyword must be specific enough that a hit
# strongly implies a workflow/software conversation, not general firehouse talk.
OUTCOME_AREAS = {
    "Asset management": [
        "asset management", "asset tracking", "track our equipment",
        "track our gear", "tracking equipment", "tracking gear",
        "lost equipment", "missing equipment", "asset tag", "rfid tag",
        "barcoded", "barcode scanner", "checked out gear", "checked-in gear",
        "equipment inventory software", "gear inventory software",
        "inventory software", "inventory tracking",
    ],
    "Controlled substance chain-of-custody": [
        "narcotics log", "narcotic log", "narc log", "narc book",
        "controlled substance", "chain of custody", "chain-of-custody",
        "fentanyl log", "ds book", "ds log", "drug log", "drug waste",
        "witness waste", "narcotics tracking", "narcotic tracking",
        "narcotics inventory", "narcotic count",
    ],
    "NFPA compliance": [
        "nfpa 1500", "nfpa 1851", "nfpa 1852", "nfpa 1932", "nfpa 1989",
        "ppe inspection", "turnout inspection", "advanced inspection",
        "iso audit", "iso rating", "compliance audit", "inspection paperwork",
        "compliance tracking", "compliance software",
    ],
    "SCBA tracking": [
        "scba tracking", "scba inspection", "scba software",
        "scba flow test", "scba flow-test", "flow testing scba",
        "cylinder hydro", "bottle hydro", "posichek", "posi check",
        "scba records", "scba maintenance", "air pack tracking",
        "airpack tracking", "scba fit test", "scba inventory",
    ],
    "Apparatus inspection": [
        "apparatus check", "rig check", "truck check sheet", "engine check sheet",
        "daily truck check", "weekly truck check", "pump test", "ladder test",
        "aerial test", "rig inventory", "truck inventory", "vehicle check sheet",
        "check sheet", "checksheet", "morning checks", "shift check",
        "apparatus inspection", "apparatus inventory",
    ],
    "Personnel/scheduling": [
        "scheduling software", "schedule software", "shift trade software",
        "shift swap software", "kelly schedule", "staffing software",
        "overtime tracking", "minimum staffing software",
        "personnel software", "credentials tracking", "cert tracking",
        "certification tracking", "callback system", "roster software",
        "aladtec", "crewsense",
    ],
}

# Workflow-pain markers — only count an outcome hit as "pain" when one of these appears
WISH_PATTERNS = [
    r"\bi wish there (was|were) (a |an )?(software|app|system|tool|program)\b",
    r"\b(any|anyone know of|recommend|recommendation for|looking for) (a |an )?(software|app|system|program|tool|platform)\b",
    r"\bstill (use|using) (paper|spreadsheets?|excel)\b",
    r"\b(we|our (dept|department|station|agency|service)) (track|tracks|log|logs|do|does) (this|everything|that|it|inventory|inspections?) on paper\b",
    r"\bpaper (logs?|sheets?|binders?|tracking|trail|forms?)\b",
    r"\bspreadsheet (hell|mess|nightmare|tracking)\b",
    r"\b(too much|hours of) paperwork\b",
    r"\b(fail|failed|missed) (audit|inspection|compliance)\b",
    r"\bcompliance (nightmare|headache|hell|issue|problem)\b",
    r"\b(switched|switching) (from|to) [A-Z]",
    r"\b(manual|by hand) (tracking|logging|process)\b",
    r"\b(lose|losing|lost) track\b",
    r"\bcan'?t (find|track|locate) (our|the) (gear|equipment|stuff|inventory)\b",
    r"\bbroken (process|workflow|system)\b",
    r"\bhate (our|the) (current|existing) (system|software|process)\b",
]

# Cold filter — career/recruitment/gear/news/drama/training. Checked FIRST.
COLD_HINTS = [
    # career / employment / recruitment
    "interview tips", "got the job", "got hired", "hiring process",
    "academy advice", "test prep", "civil service", "cpat", "physical agility",
    "employment question", "career advice", "job search", "applying to",
    "background check", "polygraph", "oral board",
    # gear / personal items
    "what boots", "boot recommendation", "boots recommendation",
    "helmet recommendation", "what helmet", "what flashlight", "edc",
    "tattoo", "haircut", "mustache", "beard",
    # social / news / culture
    "memes", "shitpost", "rip ", "thoughts and prayers", "fallen brother",
    "lodd", "obituary", "preserved", "world firefighters day",
    "history of", "antique", "vintage",
    # fitness
    "fitness routine", "workout", "lift weights", "pt test", "the gym",
    # academy / training
    "fire academy", "the academy", "academy training", "academy life",
    "rookie advice", "new recruit", "probie",
    # pay / contract
    "pay cut", "pay raise", "union contract", "step pay",
    "salary", "wages",
    # generic threads
    "weekly question thread", "weekly employment", "weekly thread",
    "daily question thread", "daily thread", "megathread",
]

USER_AGENT = os.environ.get("REDDIT_USER_AGENT", "voc-scanner/0.1 (by /u/your-reddit-username)")


def load_env():
    """Best-effort .env loader."""
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def load_seen():
    if STATE_FILE.exists():
        try:
            data = json.loads(STATE_FILE.read_text())
            return set(data.get("seen_ids", []))
        except Exception:
            return set()
    return set()


def save_seen(seen_ids: set):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    # Cap at most-recent 5000 to prevent unbounded growth
    ids = list(seen_ids)
    payload = {
        "seen_ids": ids[-5000:],
        "updated": dt.datetime.now(dt.timezone.utc).isoformat(),
    }
    STATE_FILE.write_text(json.dumps(payload, indent=2))


def fetch_sub_new(sub: str, limit: int = LIMIT_PER_SUB):
    """Fetch /new posts from a subreddit via the public JSON endpoint."""
    url = f"https://www.reddit.com/r/{sub}/new.json?limit={limit}"
    headers = {"User-Agent": USER_AGENT}
    r = requests.get(url, headers=headers, timeout=15)
    if r.status_code != 200:
        raise RuntimeError(f"r/{sub} -> HTTP {r.status_code}")
    data = r.json()
    return [c["data"] for c in data.get("data", {}).get("children", [])]


def fetch_top_comments(sub: str, post_id: str, n: int = TOP_COMMENTS):
    url = f"https://www.reddit.com/r/{sub}/comments/{post_id}.json?sort=top&limit={n+5}"
    headers = {"User-Agent": USER_AGENT}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code != 200:
            return []
        data = r.json()
        if len(data) < 2:
            return []
        children = data[1].get("data", {}).get("children", [])
        comments = []
        for c in children[:n+5]:
            if c.get("kind") != "t1":
                continue
            body = c.get("data", {}).get("body", "")
            if body and body != "[deleted]" and body != "[removed]":
                comments.append(body)
            if len(comments) >= n:
                break
        return comments
    except Exception:
        return []


def contains_competitor(text_lc: str):
    """Return the matched competitor token (lowercased) or None.

    Exact tokens (ESO, Adashi, etc.) use \\b word boundaries so they don't
    fire inside longer words (e.g. "eso" inside "resource").
    Phrase tokens (Vector Solutions, ImageTrend, etc.) are matched as plain
    substrings — they're distinctive enough that substring matching is safe.
    """
    for c in _EXACT_LC:
        if re.search(rf"\b{re.escape(c)}\b", text_lc):
            return c
    for c in _PHRASE_LC:
        if c in text_lc:
            return c
    return None


def map_outcome(text_lc: str):
    hits = []
    for area, kws in OUTCOME_AREAS.items():
        for kw in kws:
            if kw in text_lc:
                hits.append((area, kw))
                break
    return hits


def matches_wish(text_lc: str):
    for pat in WISH_PATTERNS:
        if re.search(pat, text_lc):
            return True
    return False


def is_cold(text_lc: str):
    for kw in COLD_HINTS:
        if kw in text_lc:
            return True
    return False


SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+|\n+")


def build_sections(post: dict, comments: list[str]) -> list[tuple[str, str]]:
    """Return [(source_label, raw_text), ...] for title, body, and each comment."""
    sections: list[tuple[str, str]] = []
    title = (post.get("title", "") or "").strip()
    body = (post.get("selftext", "") or "").strip()
    if title:
        sections.append(("title", title))
    if body:
        sections.append(("body", body))
    for i, c in enumerate(comments[:TOP_COMMENTS], 1):
        c = (c or "").strip()
        if c:
            sections.append((f"comment-{i}", c))
    return sections


def triage(post: dict, comments: list[str]):
    sections = build_sections(post, comments)
    combined = "\n".join(t for _, t in sections)
    text_lc = combined.lower()
    title_lc = (post.get("title", "") or "").lower()

    # Cold check FIRST — career/gear/news/drama/training dominate Reddit and
    # should drop even if they incidentally mention an outcome keyword.
    if is_cold(text_lc) or is_cold(title_lc):
        return "Cold", None, [], sections

    comp = contains_competitor(text_lc)
    outcome_hits = map_outcome(text_lc)
    wish = matches_wish(text_lc)

    # Hot: competitor named OR (outcome + clear workflow-failure language)
    if comp:
        tier = "Hot"
    elif outcome_hits and wish:
        tier = "Hot"
    elif outcome_hits:
        tier = "Warm"
    elif wish:
        tier = "Warm"
    else:
        tier = "Cold"

    return tier, comp, outcome_hits, sections


def neutral_excerpt(text: str, max_words: int = 14) -> str:
    """Return a short, formatting-stripped excerpt ≤ max_words words.

    Per task spec: never quote more than 15 words from a single post.
    """
    cleaned = re.sub(r"\s+", " ", text).strip()
    cleaned = re.sub(r"[*_>#`~]", "", cleaned).strip()
    cleaned = re.sub(r"^\s*[-*\d.)]+\s*", "", cleaned)
    words = cleaned.split()
    if len(words) <= max_words:
        return cleaned
    return " ".join(words[:max_words]) + "…"


def pick_evidence(sections: list[tuple[str, str]],
                  competitor: Optional[str],
                  outcome_hits: list) -> tuple[str, str]:
    """Find the most relevant sentence across sections.

    Priority order:
      1. Sentence containing the named competitor
      2. Sentence containing an outcome-area keyword
      3. Sentence matching a wish/pain pattern
      4. First non-empty sentence in body or first comment
      5. Title as a last resort

    Returns (sentence, source_label).
    """
    # Pre-tokenize each section into sentences with their source label
    tokenized: list[tuple[str, str]] = []  # (source_label, sentence)
    for source, text in sections:
        for s in SENTENCE_SPLIT_RE.split(text):
            s = s.strip()
            if s:
                tokenized.append((source, s))

    if not tokenized:
        return "", "none"

    # 1. Competitor sentence
    if competitor:
        for src, sent in tokenized:
            if competitor in sent.lower():
                return sent, src

    # 2. Outcome-area keyword sentence
    for area, kw in outcome_hits:
        for src, sent in tokenized:
            if kw in sent.lower():
                return sent, src

    # 3. Wish/pain pattern sentence
    for src, sent in tokenized:
        sent_lc = sent.lower()
        for pat in WISH_PATTERNS:
            if re.search(pat, sent_lc):
                return sent, src

    # 4. First body/comment sentence (skip title-only fallback if body exists)
    for src, sent in tokenized:
        if src != "title":
            return sent, src

    # 5. Fallback: title
    return tokenized[0]


def derive_signal_sentence(sections: list[tuple[str, str]], tier: str,
                          competitor: Optional[str],
                          outcome_hits: list) -> str:
    """Build the one-line Signal value for the digest.

    Pulls the matched evidence sentence (from title, body, or top-comment)
    rather than mirroring the post title. Caps any direct excerpt at 14 words.
    """
    sent, source = pick_evidence(sections, competitor, outcome_hits)
    if not sent:
        return "(no excerpt available)"
    excerpt = neutral_excerpt(sent, 14)
    # Tag source so the reader knows where the signal actually came from
    src_tag = "title" if source == "title" else source
    return f"\"{excerpt}\" [{src_tag}]"


def why_matters(tier: str, competitor: Optional[str], outcome_hits: list) -> str:
    if competitor and competitor != "pstrax":
        comp_name = competitor.title()
        return (f"Competitive intel — {comp_name} mention in operator community; "
                "watch for sentiment shifts or feature gaps.")
    if competitor == "pstrax":
        return "Direct brand mention — review for sentiment, customer support need, or advocacy opportunity."
    if outcome_hits:
        areas = ", ".join(sorted({a for a, _ in outcome_hits}))
        return (f"Maps to {areas} — potential expansion or churn signal for "
                "≤2-module accounts; track for pattern across week.")
    return "Workflow-pain signal without specific software named — possible category-drift or feature-gap input."


def outcome_label(outcome_hits: list) -> str:
    if not outcome_hits:
        return "unmapped"
    return ", ".join(sorted({a for a, _ in outcome_hits}))


def post_is_within_window(post: dict, hours: int = LOOKBACK_HOURS) -> bool:
    created = post.get("created_utc")
    if not created:
        return True
    age_hr = (time.time() - float(created)) / 3600.0
    return age_hr <= hours


def main():
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=-4))).date()  # ET (EDT)
    out_path = OUTPUT_FILE
    out_path.parent.mkdir(parents=True, exist_ok=True)

    env = load_env()
    auth_mode = "public-json"
    if env.get("REDDIT_CLIENT_ID") and env.get("REDDIT_CLIENT_SECRET"):
        # We would use PRAW here, but it's not installed; document and fall back.
        auth_mode = "public-json (PRAW unavailable; .env present but not used)"

    seen = load_seen()
    seen_before = len(seen)
    new_ids_this_run: list[str] = []

    hot_entries = []
    warm_entries = []
    cold_count = 0
    raw_count = 0
    errors = []

    for sub in SUBREDDITS:
        try:
            posts = fetch_sub_new(sub)
        except Exception as e:
            errors.append(f"r/{sub} fetch failed: {e}")
            continue
        for p in posts:
            raw_count += 1
            pid = p.get("id")
            if not pid:
                continue
            if pid in seen:
                continue
            if not post_is_within_window(p):
                # Still mark as seen so we don't keep evaluating it
                seen.add(pid)
                new_ids_this_run.append(pid)
                continue

            comments = fetch_top_comments(sub, pid, TOP_COMMENTS)
            tier, comp, outcome_hits, sections = triage(p, comments)

            seen.add(pid)
            new_ids_this_run.append(pid)

            if tier == "Cold":
                cold_count += 1
                continue

            entry = {
                "sub": sub,
                "title": (p.get("title") or "").strip(),
                "link": f"https://www.reddit.com{p.get('permalink','')}",
                "tier": tier,
                "competitor": comp,
                "outcome_hits": outcome_hits,
                "signal": derive_signal_sentence(sections, tier, comp, outcome_hits),
                   "why": why_matters(tier, comp, outcome_hits),
            }
            if tier == "Hot":
                hot_entries.append(entry)
            else:
                warm_entries.append(entry)

            # Be polite to Reddit's anonymous endpoint
            time.sleep(0.4)

        time.sleep(0.5)


    # Only append when there are Hot or Warm signals
    if not hot_entries and not warm_entries:
        save_seen(seen)
        print(f"No Hot/Warm signals — skipping write. Hot: 0 Warm: 0 Cold: {cold_count} Raw: {raw_count}")
        if errors:
            print("ERRORS:")
            for e in errors:
                print(" -", e)
        return

    # Compose section to append
    lines = [f"## {today.isoformat()} — Hot: {len(hot_entries)} | Warm: {len(warm_entries)}", ""]

    if hot_entries:
        lines.append(f"### 🔴 Hot Signals ({len(hot_entries)})")
        for e in hot_entries:
            lines.append("")
            lines.append(f"**r/{e['sub']} — [{e['title']}]({e['link']})**")
            lines.append(f"- Signal: {e['signal']}")
            lines.append(f"- Outcome area: {outcome_label(e['outcome_hits'])}")
            lines.append(f"- Why it matters: {e['why']}")

    if warm_entries:
        lines.append("")
        lines.append(f"### 🟡 Warm Signals ({len(warm_entries)})")
        for e in warm_entries:
            lines.append("")
            lines.append(f"**r/{e['sub']} — [{e['title']}]({e['link']})**")
            lines.append(f"- Signal: {e['signal']}")
            lines.append(f"- Outcome area: {outcome_label(e['outcome_hits'])}")
            lines.append(f"- Why it matters: {e['why']}")

    notes = []
    if errors:
        for err in errors:
            notes.append(err)
    if notes:
        lines.append("")
        lines.append("_Run notes: " + " | ".join(notes) + "_")

    lines.append("")
    lines.append("---")
    lines.append("")

    # Ensure file has a header if it doesn't exist yet
    if not out_path.exists():
        header = ["# VOC Reddit Signal Log", "",
                  "_Appended automatically each morning. Only days with Hot or Warm signals appear here._",
                  "", "---", ""]
        out_path.write_text("\n".join(header))

    with out_path.open("a") as f:
        f.write("\n".join(lines) + "\n")

    save_seen(seen)
    print(f"APPENDED: {out_path}")
    print(f"Hot: {len(hot_entries)} Warm: {len(warm_entries)} Cold: {cold_count} Raw: {raw_count}")
    if errors:
        print("ERRORS:")
        for e in errors:
            print(" -", e)

if __name__ == "__main__":
    main()
