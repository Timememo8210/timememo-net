#!/usr/bin/env python3
"""
refresh_indexes.py — keep sky-portal's homepage in sync with the daily series.

The daily pipelines create research/tech/market/science pages but the homepage
lists were hand-written and froze (research stopped at 6/14 while 93 reports
exist). This script rescans the actual files and regenerates:

  1. Sidebar nav lists for each daily series (latest N + "All →" link kept)
  2. The "Today's Updates" recent-pill strips
  3. Each series card's issue count and date range

Idempotent: run it any time, from the repo root or with the root as argv[1].
Future maintenance = one step: after adding a daily page, run

    python3 tools/refresh_indexes.py

and commit the result together with the new page.
"""
import re, sys, glob, os

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
INDEX = os.path.join(ROOT, "index.html")
NAV_N = 7          # links shown per series in the sidebar
STRIP2_DATES = 3   # how many recent dates feed the second pill strip

SERIES = [  # order matters for pills
    dict(d="research", p="report",  zh="研报",     en="Report",  icon="📊"),
    dict(d="tech",     p="tech",    zh="科技",     en="Tech",    icon="💻"),
    dict(d="market",   p="market",  zh="行情",     en="Market",  icon="📈"),
    dict(d="science",  p="science", zh="科学周报", en="Science", icon="🧬"),
    dict(d="ai",       p="ai",      zh="AI",       en="AI",      icon="🤖"),
]

def mdd(date):                      # '2026-06-09' -> '6/9'
    _, m, d = date.split("-")
    return f"{int(m)}/{int(d)}"

def scan(s):
    files = glob.glob(os.path.join(ROOT, s["d"], f"{s['p']}-????-??-??.html"))
    dates = sorted(re.search(r"(\d{4}-\d{2}-\d{2})", os.path.basename(f)).group(1)
                   for f in files)
    return dates

def nav_link(s, date):
    return (f'        <a href="{s["d"]}/{s["p"]}-{date}.html">'
            f'<span class="zh">{mdd(date)} {s["zh"]}</span>'
            f'<span class="en">{mdd(date)} {s["en"]}</span>'
            f'<span class="nav-date">{mdd(date)}</span></a>\n')

def pill(s, date, today=False, compact=False):
    cls = "recent-pill today" if today else "recent-pill"
    if compact:
        return (f'      <a class="{cls}" href="{s["d"]}/{s["p"]}-{date}.html">'
                f'<span class="pill-date">{s["icon"]}</span> {mdd(date)} '
                f'<span class="zh">{s["zh"]}</span><span class="en">{s["en"]}</span></a>\n')
    return (f'      <a class="{cls}" href="{s["d"]}/{s["p"]}-{date}.html">'
            f'{s["icon"]} <span class="zh">{mdd(date)} {s["zh"]}</span>'
            f'<span class="en">{mdd(date)} {s["en"]}</span></a>\n')

def main():
    html = open(INDEX, encoding="utf-8").read()
    data = {s["d"]: (s, scan(s)) for s in SERIES}
    changed = []

    # ── 1. sidebar nav lists ──────────────────────────────────────────
    for d, (s, dates) in data.items():
        if not dates:
            continue
        # links block = consecutive <a href="dir/prefix-...."> lines that sit
        # directly before the series' "All →" link inside its nav-sub
        pat = re.compile(
            r'(?P<links>(?:[ \t]*<a href="%s/%s-[^"]+"[^\n]*\n)+)'
            r'(?=[ \t]*<a href="%s/index\.html")' % (d, s["p"], d))
        m = pat.search(html)
        if not m:
            continue
        new = "".join(nav_link(s, dt) for dt in reversed(dates[-NAV_N:]))
        if m.group("links") != new:
            html = html[:m.start("links")] + new + html[m.end("links"):]
            changed.append(f"nav:{d} -> latest {min(NAV_N, len(dates))} (newest {dates[-1]})")

    # ── 2. today pills ────────────────────────────────────────────────
    sec = re.compile(
        r'(<div class="section" id="today">.*?)'
        r'(<div class="recent-strip">.*?</div>\s*<div class="recent-strip">.*?</div>)',
        re.S)
    m = sec.search(html)
    if m:
        newest = max((ds[-1], d) for d, (_, ds) in data.items() if ds)[0]
        strip1 = "".join(
            pill(s, ds[-1], today=(ds[-1] == newest))
            for d, (s, ds) in data.items() if ds)
        recent = []
        for d, (s, ds) in data.items():
            if s["d"] == "ai":            # paused series: keep out of history strip
                continue
            for dt in ds[-1 - STRIP2_DATES:-1]:
                recent.append((dt, s))
        recent.sort(key=lambda x: x[0], reverse=True)
        strip2 = "".join(pill(s, dt, compact=True) for dt, s in recent)
        block = ('<div class="recent-strip">\n' + strip1 + '    </div>\n'
                 '    <div class="recent-strip">\n' + strip2 + '    </div>')
        if m.group(2) != block:
            html = html[:m.start(2)] + block + html[m.end(2):]
            changed.append("pills: regenerated both strips")

    # ── 3. card counts + date ranges ──────────────────────────────────
    for d, (s, dates) in data.items():
        if not dates:
            continue
        cpat = re.compile(
            r'(<a class="card" href="%s/index\.html">.*?</a>)' % d, re.S)
        m = cpat.search(html)
        if not m:
            continue
        card = new_card = m.group(1)
        new_card = re.sub(r'—\s*\d+\s*篇', f'— {len(dates)}篇', new_card)
        new_card = re.sub(r'—\s*\d+\s+(issues|posts|entries|reports)',
                          lambda mm: f'— {len(dates)} {mm.group(1)}', new_card)
        new_card = re.sub(r'(<div class="meta"><span>)[^<]*(</span>)',
                          lambda mm: mm.group(1) + f'{mdd(dates[0])} — {mdd(dates[-1])}' + mm.group(2),
                          new_card, count=1)
        if new_card != card:
            html = html[:m.start(1)] + new_card + html[m.end(1):]
            changed.append(f"card:{d} -> {len(dates)} items, {mdd(dates[0])}—{mdd(dates[-1])}")

    # ── 4. stats-bar series counts ────────────────────────────────────
    LABEL = {"research": "每日研报", "tech": "每日科技",
             "market": "每日行情", "science": "每周科学"}
    for d, (s, dates) in data.items():
        zh = LABEL.get(d)
        if not zh or not dates:
            continue
        spat = re.compile(
            r'(<span class="stat-num">)(\d+)(</span><span class="stat-label">'
            r'<span class="zh">%s</span>)' % zh)
        sm = spat.search(html)
        if sm and sm.group(2) != str(len(dates)):
            html = spat.sub(lambda mm: mm.group(1) + str(len(dates)) + mm.group(3), html)
            changed.append(f"stats:{d} {sm.group(2)} -> {len(dates)}")

    # ── 5. footer "Updated" date ──────────────────────────────────────
    latest = max(ds[-1] for _, ds in data.values() if ds)
    fpat = re.compile(r'(更新于</span><span class="en">Updated</span> )(\d{4}-\d{2}-\d{2})')
    fm = fpat.search(html)
    if fm and fm.group(2) != latest:
        html = fpat.sub(lambda mm: mm.group(1) + latest, html)
        changed.append(f"footer date {fm.group(2)} -> {latest}")

    open(INDEX, "w", encoding="utf-8").write(html)
    print("Series found:", {d: (len(ds), ds[-1] if ds else "-") for d, (_, ds) in data.items()})
    print("Changes:" if changed else "Already up to date.")
    for c in changed:
        print("  •", c)

if __name__ == "__main__":
    main()
