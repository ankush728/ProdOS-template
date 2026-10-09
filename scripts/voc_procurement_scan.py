#!/usr/bin/env python3
"""
VOC Procurement Daily Scan
Queries SAM.gov API and state procurement portals for new RFPs/RFIs relevant
to fire and EMS software. Triages into Active Deal / Competitive Watch /
Category Signal. Appends a dated section to output/voc/procurement_scan.md.

Usage:
    python scripts/voc_procurement_scan.py [--dry-run]

Requirements:
    pip install requests beautifulsoup4 --break-system-packages

Environment (.env):
    SAM_API_KEY=<your key from api.sam.gov>
"""

import argparse
import json
import os
import re
import sys
import time
import datetime as dt
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
STATE_FILE    = ROOT / "state"  / "voc" / "seen_solicitation_ids.json"
OUTPUT_FILE   = ROOT / "output" / "voc" / "procurement_scan.md"
WATCHLIST_FILE = ROOT / "config" / "voc" / "procurement_watchlist.json"
ENV_FILE      = ROOT / ".env"

# ---------------------------------------------------------------------------
# Load .env (simple key=value parser, no dependency on python-dotenv)
# ---------------------------------------------------------------------------
def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

load_env(ENV_FILE)
SAM_API_KEY = os.environ.get("SAM_API_KEY", "")

# ---------------------------------------------------------------------------
# Search term tiers
# ---------------------------------------------------------------------------
TIER_A = [
    "fire records management",
    "EMS records management",
    "fire RMS",
    "NFIRS",
    "ePCR",
    "fire department software",
    "SCBA tracking",
    "fire apparatus inspection",
    "controlled substance tracking fire",
    "controlled substance tracking EMS",
    "PPE tracking fire",
    "PPE inspection fire",
    "apparatus inspection software",
    "SCBA software",
    "fire compliance software",
    "EMS compliance software",
]

TIER_B = [
    "fire department software",
    "fire department compliance",
    "EMS compliance software",
    "fire station software",
    "first responder software",
    "public safety records management",
]

COMPETITORS = [
    "ESO", "Vector Solutions", "IamResponding", "I am Responding",
    "FireRMS", "Emergency Reporting", "ImageTrend", "Operative IQ",
    "OperativeIQ", "Adashi", "Aladtec", "CrewSense",
]
COMPETITORS_RE = re.compile(
    "|".join(re.escape(c) for c in COMPETITORS), re.IGNORECASE
)

# Triage keywords for Active Deal detection
ACTIVE_DEAL_SIGNALS = re.compile(
    r"\b(request for proposal|rfp|request for information|rfi|"
    r"invitation to bid|itb|sources sought|notice of intent|"
    r"evaluation criteria|submission deadline|proposal due|"
    r"response deadline|proposals due)\b",
    re.IGNORECASE,
)

# Category signal — broader market language without specific deal
CATEGORY_SIGNALS = re.compile(
    r"\b(moderniz|evaluat|assess|replac|upgrad|replac|transition|"
    r"considering|exploratory|market research|industry day)\b",
    re.IGNORECASE,
)

# Hard drops — contract awards, unrelated procurement
DROP_SIGNALS = re.compile(
    r"\b(contract award|notice of award|award notice|police vehicle|"
    r"dispatch hardware|radio procurement|turnout gear purchase|"
    r"protective clothing purchase|fire truck purchase|apparatus purchase|"
    r"fire engine purchase|ambulance purchase|construction|"
    r"janitorial|food service|uniforms)\b",
    re.IGNORECASE,
)

# Outcome area keyword map (title + description matching)
OUTCOME_AREAS: Dict[str, List[str]] = {
    "Asset management": [
        "asset management", "asset tracking", "equipment tracking",
        "gear tracking", "inventory management", "rfid", "barcode",
        "asset tag",
    ],
    "Controlled substance chain-of-custody": [
        "controlled substance", "narcotics", "chain of custody",
        "drug tracking", "narc log", "fentanyl tracking",
    ],
    "NFPA compliance": [
        "nfpa", "ppe inspection", "turnout inspection", "iso audit",
        "compliance tracking", "fire compliance",
    ],
    "SCBA tracking": [
        "scba", "self-contained breathing apparatus", "air pack",
        "breathing apparatus", "scba inspection", "scba records",
    ],
    "Apparatus inspection": [
        "apparatus inspection", "apparatus check", "vehicle inspection",
        "rig check", "truck check", "pump test", "aerial test",
        "daily inspection",
    ],
    "Procurement management": [
        "procurement", "purchasing", "bid management", "vendor management",
        "contract management",
    ],
}


def map_outcome_area(title: str, description: str) -> str:
    text = (title + " " + description).lower()
    for area, keywords in OUTCOME_AREAS.items():
        if any(kw.lower() in text for kw in keywords):
            return area
    # Broad fire/EMS software with no specific module
    if re.search(r"\b(fire|ems|records management|rms)\b", text, re.IGNORECASE):
        return "platform-wide"
    return "unmapped"


def triage(title: str, description: str, notice_type: str) -> str:
    """
    Returns: 'active_deal' | 'competitive_watch' | 'category_signal' | 'drop'
    """
    text = title + " " + description

    # Always drop contract awards and unrelated procurement
    if DROP_SIGNALS.search(text):
        return "drop"

    # Competitor mentioned → Competitive Watch (regardless of other signals)
    if COMPETITORS_RE.search(text):
        return "competitive_watch"

    # Active Deal: RFP/RFI/sources sought with explicit fire/EMS software scope
    fire_ems = re.search(
        r"\b(fire|ems|emergency medical|first responder|fire department|"
        r"fire station|fire district|fire protection)\b",
        text, re.IGNORECASE,
    )
    if fire_ems and ACTIVE_DEAL_SIGNALS.search(text):
        return "active_deal"

    # Category Signal: broader language
    if fire_ems and CATEGORY_SIGNALS.search(text):
        return "category_signal"

    # If notice_type is sources sought → category signal by default
    if notice_type in ("r", "s") and fire_ems:
        return "category_signal"

    return "drop"


# ---------------------------------------------------------------------------
# State management
# ---------------------------------------------------------------------------
def load_state() -> Dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"seen_ids": [], "last_run": None}


def save_state(state: Dict) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2))


# ---------------------------------------------------------------------------
# SAM.gov API
# ---------------------------------------------------------------------------
SAM_BASE = "https://api.sam.gov/opportunities/v2/search"
SAM_DATE_FMT = "%m/%d/%Y"  # SAM.gov date format


def sam_search(query: str, posted_from: str, posted_to: str,
               seen_ids: set, dry_run: bool = False) -> List[Dict]:
    """
    Query SAM.gov for a single search term. Returns list of opportunity dicts.
    posted_from / posted_to: MM/DD/YYYY strings.
    """
    if not SAM_API_KEY:
        return []

    params = {
        "api_key": SAM_API_KEY,
        "q": query,
        "postedFrom": posted_from,
        "postedTo": posted_to,
        "ptype": "o,r,k,p",   # solicitation, sources sought, combined, presolicitation
        "limit": 100,
        "offset": 0,
    }

    results = []
    try:
        resp = requests.get(SAM_BASE, params=params, timeout=20)
        if resp.status_code == 403:
            print(f"  [SAM.gov] 403 Forbidden — check SAM_API_KEY")
            return []
        if resp.status_code != 200:
            print(f"  [SAM.gov] HTTP {resp.status_code} for query '{query}'")
            return []

        data = resp.json()
        opps = data.get("opportunitiesData", [])

        for opp in opps:
            uid = opp.get("noticeId") or opp.get("solicitationNumber") or ""
            if not uid or uid in seen_ids:
                continue
            results.append({
                "id": uid,
                "source": "SAM.gov",
                "title": opp.get("title", ""),
                "agency": opp.get("fullParentPathName") or opp.get("organizationName", ""),
                "posted": opp.get("postedDate", "")[:10],
                "deadline": (opp.get("responseDeadLine") or "")[:10],
                "value": opp.get("award", {}).get("amount", "") if opp.get("award") else "",
                "link": f"https://sam.gov/opp/{opp.get('noticeId', '')}/view",
                "description": (opp.get("description") or "")[:500],
                "notice_type": opp.get("type", ""),
            })

        time.sleep(0.3)  # be polite

    except requests.RequestException as e:
        print(f"  [SAM.gov] Request error for '{query}': {e}")

    return results


def run_sam_queries(seen_ids: set, dry_run: bool = False) -> Tuple[List[Dict], List[str]]:
    """
    Run all Tier A + Tier B queries. Returns (results, errors).
    """
    if not SAM_API_KEY:
        return [], ["SAM_API_KEY not set in .env — skipping SAM.gov"]

    today = dt.date.today()
    yesterday = today - dt.timedelta(days=1)
    posted_from = yesterday.strftime(SAM_DATE_FMT)
    posted_to   = today.strftime(SAM_DATE_FMT)

    all_results: List[Dict] = []
    errors: List[str] = []
    seen_in_run: set = set()

    for tier, terms in [("A", TIER_A), ("B", TIER_B)]:
        for term in terms:
            hits = sam_search(term, posted_from, posted_to, seen_ids | seen_in_run, dry_run)
            for h in hits:
                if h["id"] not in seen_in_run:
                    seen_in_run.add(h["id"])
                    all_results.append(h)

    return all_results, errors


# ---------------------------------------------------------------------------
# State portal scrapers
# ---------------------------------------------------------------------------
def _scrape_generic(portal: Dict, seen_ids: set) -> Tuple[List[Dict], Optional[str]]:
    """
    Generic HTML scraper attempt. Returns (results, error_string|None).
    Most state portals require JavaScript or sessions, so this is best-effort.
    We extract any table rows or list items that look like solicitation listings.
    """
    url = portal.get("search_url") or portal.get("url")
    state = portal.get("state", "")
    name  = portal.get("name", "")

    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; procurement-scanner/1.0)"}
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            return [], f"{name}: HTTP {resp.status_code}"

        soup = BeautifulSoup(resp.text, "html.parser")
        results = []

        # Heuristic: find rows/links that contain "fire" or "EMS" keywords
        FIRE_EMS_RE = re.compile(
            r"\b(fire|ems|emergency medical|scba|apparatus|nfirs|epcr)\b",
            re.IGNORECASE,
        )

        # Try tables first
        for row in soup.find_all("tr"):
            text = row.get_text(" ", strip=True)
            if not FIRE_EMS_RE.search(text):
                continue
            # Extract link if present
            link = ""
            a = row.find("a", href=True)
            if a:
                href = a["href"]
                if not href.startswith("http"):
                    from urllib.parse import urljoin
                    href = urljoin(url, href)
                link = href

            uid = link or text[:60]
            if uid in seen_ids:
                continue

            results.append({
                "id": uid,
                "source": name,
                "title": text[:120],
                "agency": f"{state} — {name}",
                "posted": dt.date.today().isoformat(),
                "deadline": "",
                "value": "",
                "link": link,
                "description": text[:500],
                "notice_type": "r",  # treat portal hits as sources-sought tier
            })

        return results, None

    except requests.RequestException as e:
        return [], f"{name}: {e}"


def run_portal_queries(seen_ids: set) -> Tuple[List[Dict], List[str]]:
    if not WATCHLIST_FILE.exists():
        return [], ["procurement_watchlist.json not found"]

    watchlist = json.loads(WATCHLIST_FILE.read_text())
    all_results: List[Dict] = []
    errors: List[str] = []
    seen_in_run: set = set()

    for portal in watchlist.get("portals", []):
        hits, err = _scrape_generic(portal, seen_ids | seen_in_run)
        if err:
            errors.append(err)
        for h in hits:
            if h["id"] not in seen_in_run:
                seen_in_run.add(h["id"])
                all_results.append(h)

    return all_results, errors


# ---------------------------------------------------------------------------
# Report formatting
# ---------------------------------------------------------------------------
def format_entry(item: Dict, tier: str) -> str:
    title    = item["title"] or "(no title)"
    agency   = item["agency"] or "Unknown agency"
    link     = item["link"]   or "(no link)"
    posted   = item["posted"] or "unknown"
    deadline = item["deadline"] or "not listed"
    value    = item["value"]   or "not listed"
    summary  = item.get("summary", "")
    outcome  = item.get("outcome_area", "unmapped")
    comp     = item.get("competitive_read", "")

    lines = [
        f"#### {title}",
        f"- **Agency:** {agency}",
        f"- **Link:** {link}",
        f"- **Posted:** {posted} | **Deadline:** {deadline} | **Est. Value:** {value}",
    ]
    if summary:
        lines.append(f"- **Summary:** {summary}")
    lines.append(f"- **Outcome area:** {outcome}")
    if comp:
        lines.append(f"- **Competitive read:** {comp}")
    return "\n".join(lines)


def build_competitive_read(item: Dict) -> str:
    text = item["title"] + " " + item["description"]
    found = COMPETITORS_RE.findall(text)
    if found:
        unique = list(dict.fromkeys(found))  # preserve order, dedupe
        return f"Incumbent / named competitor: {', '.join(unique)}. Displacement opportunity."
    # Category signal — no competitor named
    if CATEGORY_SIGNALS.search(text):
        return "No incumbent named. Category drift signal — evaluating options."
    return "No incumbent named."


def build_summary(item: Dict) -> str:
    """One-sentence summary from title + first 500 chars of description."""
    title = item["title"]
    desc  = item["description"][:200]
    # Strip HTML artifacts
    desc  = re.sub(r"<[^>]+>", " ", desc)
    desc  = re.sub(r"\s+", " ", desc).strip()
    if desc and desc.lower() not in title.lower():
        return f"{title}: {desc[:100]}."
    return title + "."


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main(dry_run: bool = False) -> None:
    today_str = dt.date.today().isoformat()
    print(f"[procurement-scan] {today_str} — starting")

    state    = load_state()
    seen_ids = set(state.get("seen_ids", []))
    orig_count = len(seen_ids)

    # --- Collect from SAM.gov ---
    print("[procurement-scan] Querying SAM.gov...")
    sam_results, sam_errors = run_sam_queries(seen_ids, dry_run)
    print(f"  SAM.gov: {len(sam_results)} new matches")

    # --- Collect from state portals ---
    print("[procurement-scan] Scraping state portals...")
    portal_results, portal_errors = run_portal_queries(seen_ids)
    print(f"  State portals: {len(portal_results)} new matches")

    all_errors = sam_errors + portal_errors
    if all_errors:
        for e in all_errors:
            print(f"  [WARN] {e}")

    # --- Combine + deduplicate ---
    combined = sam_results + portal_results
    seen_in_run: set = set()
    unique: List[Dict] = []
    for item in combined:
        uid = item["id"]
        if uid not in seen_ids and uid not in seen_in_run:
            seen_in_run.add(uid)
            unique.append(item)

    # --- Triage ---
    active_deals:       List[Dict] = []
    competitive_watch:  List[Dict] = []
    category_signals:   List[Dict] = []
    dropped = 0

    for item in unique:
        tier = triage(item["title"], item["description"], item.get("notice_type", ""))
        item["tier"]            = tier
        item["outcome_area"]    = map_outcome_area(item["title"], item["description"])
        item["summary"]         = build_summary(item)
        item["competitive_read"] = build_competitive_read(item)

        if tier == "active_deal":
            active_deals.append(item)
        elif tier == "competitive_watch":
            competitive_watch.append(item)
        elif tier == "category_signal":
            category_signals.append(item)
        else:
            dropped += 1

    kept = active_deals + competitive_watch + category_signals
    print(
        f"  Triage: {len(active_deals)} active deals | "
        f"{len(competitive_watch)} competitive watch | "
        f"{len(category_signals)} category signals | "
        f"{dropped} dropped"
    )

    # --- Build markdown section ---
    lines = [f"## {today_str} — Procurement Scan", ""]

    # Active Deals
    lines.append(f"### Active Deals ({len(active_deals)})")
    lines.append("")
    if active_deals:
        for item in active_deals:
            lines.append(format_entry(item, "active_deal"))
            lines.append("")
    else:
        lines.append("_None today._")
        lines.append("")

    # Competitive Watch
    lines.append(f"### Competitive Watch ({len(competitive_watch)})")
    lines.append("")
    if competitive_watch:
        for item in competitive_watch:
            lines.append(format_entry(item, "competitive_watch"))
            lines.append("")
    else:
        lines.append("_None today._")
        lines.append("")

    # Category Signals
    lines.append(f"### Category Signals ({len(category_signals)})")
    lines.append("")
    if category_signals:
        for item in category_signals:
            lines.append(format_entry(item, "category_signal"))
            lines.append("")
    else:
        lines.append("_None today._")
        lines.append("")

    # Portal errors
    if all_errors:
        lines.append("### Portal Errors")
        lines.append("")
        for e in all_errors:
            lines.append(f"- {e}")
        lines.append("")

    # Low signal warning
    if len(active_deals) == 0 and len(competitive_watch) < 2:
        lines.append(
            "> ⚠️ Low signal day. "
            f"Active deals: {len(active_deals)}, Competitive watch: {len(competitive_watch)}. "
            "Verify search terms and SAM.gov API key."
        )
        lines.append("")

    # Run stats
    new_id_count = len(kept)  # only keep IDs we're surfacing
    new_seen_count = len(seen_in_run)  # all IDs processed (including dropped)
    sam_note = "" if SAM_API_KEY else " (SAM_API_KEY not set)"
    lines.append(
        f"_Run stats: SAM.gov{sam_note}: {len(sam_results)} | "
        f"State portals: {len(portal_results)} | "
        f"Dropped: {dropped} | "
        f"Seen IDs: was {orig_count}, added {new_seen_count}, now {orig_count + new_seen_count}_"
    )
    lines.append("")
    lines.append("---")
    lines.append("")

    section = "\n".join(lines)

    # --- Append to rolling file ---
    if not dry_run:
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        if not OUTPUT_FILE.exists():
            header = "# VOC Procurement Scan — Rolling Log\n\n"
            OUTPUT_FILE.write_text(header)

        with OUTPUT_FILE.open("a") as f:
            f.write(section)

        # Update state
        state["seen_ids"] = sorted(seen_ids | seen_in_run)
        state["last_run"] = today_str
        save_state(state)
        print(f"[procurement-scan] Appended to {OUTPUT_FILE}")
    else:
        print("[procurement-scan] DRY RUN — output not written")
        print("--- Preview ---")
        print(section[:2000])

    print(f"[procurement-scan] Done. {len(kept)} entries surfaced.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VOC Procurement Daily Scan")
    parser.add_argument("--dry-run", action="store_true",
                        help="Run without writing output files")
    args = parser.parse_args()
    main(dry_run=args.dry_run)
