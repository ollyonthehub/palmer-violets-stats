# Palmer Violets — Statistics Website

A read-only, responsive static website for Palmer Violets FC historical stats.

## Open locally

Double-click `index.html` in your browser. No installation or server is required.

## Deploy

Upload the contents of this folder to a static website host such as Netlify, GitHub Pages or Vercel. No build step is required.

## Pages

- Overview — combined stats, recent matches, leaders
- Match archive — filter by season and competition; click for goalscorers and line-up
- Players — search and view individual stats and season/competition splits
- Records — rankings, highest-scoring matches and head-to-head opponent profiles
- Seasons — season cards and separate competition context
- Awards — Player of the Season, Goal of the Season and Top Scorer by season

## Updating data

The website is deliberately **read-only**. Add or amend verified match records in `data.json` and regenerate `data.js` with this command (from the folder):

```bash
python -c "from pathlib import Path; p=Path('.'); (p/'data.js').write_text('window.PV_DATA='+ (p/'data.json').read_text()+';\\n')"
```

A match has a unique ID, season, competition, phase, date, opponent and opponentId, GF, GA, ownGoals and a list of players (`name`, `goals`, `motm`). Shared MOTM credits are **1 for each player**. Do not assign goals for opposition own goals to a player. A missing award is represented by no player with `motm:1`; when MOTM is still unconfirmed, include `motmStatus:'unconfirmed'`.

### Sources and limitations

- 2024/25: WW Mixed (20 audited matches)
- 2025/26: HBC Men's (14 audited matches, with league/finals only as phases)
- 2026/27: HBC Men's (1 audited match), HBC Mixed (1 audited match), WW Mixed (no recorded matches yet)
- HBC Mixed Running on Prosecco took place on 16 October 2026 (same day as Rushed Intercourse); its MOTM remains unconfirmed.
- The unnamed goalkeeper vs HOTShots is omitted from player stats on request.
- Historic opponents The Playful Puppies / Funky Eh are merged under one opponent ID.
- Assists are not tracked.

No admin panel, log-in or on-site data entry is included.

## Updating season awards

The `awards` object in `data.json` contains one entry per season. `playerOfTheSeason` and `goalOfTheSeason` are left `null` until the winners are supplied; do **not** invent winners. The goal award can be a name string or an object such as `{"player": "Example Player", "description": "vs Example FC"}`. Top Scorer is calculated automatically from match goals (including League and Finals together in the same competition). Current-season Top Scorer is labelled provisional. Once awards are updated, regenerate `data.js` using the command above.

## Confirmed historical award winners

- 2024/25: Player of the Season — Oliver Graham; Goal of the Season — Max Boundy vs Kiri Crew.
- 2025/26: Player of the Season — Fabiano Jesus; Goal of the Season — Connor Passingham vs Diddy Dribblers FC.
- Goal of the Season text uses the provided award description; historical archive retains its existing opponent label.


V5 branding update: official provided Palmer Violets circular badge replaces the square PV icon, appears on homepage, and supplies website favicons. All stats and navigation remain unchanged.

## Upcoming fixtures
Upcoming fixtures are read-only and defined in `data.json` / `data.js` under `upcomingFixtures`. The Overview and Match Archive show their fixture cards; they do not affect completed-match statistics. If the opponent exists in the historical match database, an H2H summary appears. If there is no prior record, no H2H summary is displayed.

Current upcoming fixtures: 6 November 2026 — HBC Men’s vs Let’s Get Messi; HBC Mixed vs Bare Biscuits. Kick-off times have not been supplied.


## V12 — Responsive / QA pass (4 November 2026)

- Records boards stay fully visible without horizontal scrolling: true two-column tables, compact numbers, wrapping names, responsive 3-column desktop / stacked tablet and phone presentation.
- All six sections reflow for narrow screens, including wrap-around mobile navigation and card-based statistics tables.
- Player summary totals use the selected player's record (not the first player in the aggregate).
- Opponent profiles respect the active season and competition filters.
- Unknown match dates sort after dated fixtures; season goals display is calculated from the underlying match records.
- Audited data unchanged: 36 matches, 28 players, 163 credited player goals + 1 own goal.
- Automated JavaScript syntax/data-integrity/page-render checks pass.
- A visual cross-browser screenshot check could not be completed in the build environment; review on actual mobile and desktop after deployment.

### Updating GitHub from V11

Replace only `app.js` and `style.css` in your repository (both files are included in the V12 update-only ZIP). No match or player data changed.


## V13 — 2026/27 hub

Added seventh tab 2026/27, with 2026/27 fixtures, 2026/27 results, and top-10 goals/appearances/MOTM tables. Competition dropdown filters all 2026/27 content. Upcoming fixtures moved from Overview and Match Archive. All-time Records remain separate.

### Version 14: Full competition names
All competition labels and filters use Warkworth Mixed, Hibiscus Coast Mens and Hibiscus Coast Mixed. The match data and builder are updated consistently.


## Version 16 — No-scroll leaderboards and gold leaders

The 2026/27 and Records leaderboards now use fixed two-column list rows (player, relevant stat) rather than tables that force horizontal scrolling. The top-ranked player in each leaderboard has a gold name and tally; equal totals are ordered alphabetically by first name. No match data changed in this release. To update an existing GitHub deployment, replace only `app.js` and `style.css`.


### Player portraits (V17)

Approved portraits are stored as web-optimised WebP files under `images/players/` as `pfp-*.webp`.
The `playerPortraits` mapping in `app.js` associates each confirmed player name with a portrait.
For other players the website automatically displays their initials over a matching lavender/pink background.
When adding new portraits, keep a square crop and add the relative path `images/players/pfp-name.webp` to the map; no match statistics need to change.

### V18 — Player image organisation and fixture date

- The 13 approved WebP portraits now live under `images/players/`; `app.js` uses the new relative paths.
- Running on Prosecco (Hibiscus Coast Mixed, 14–3) was played **16 October 2026**, the same day as Rushed Intercourse. MOTM remains unconfirmed.
- Updating an existing GitHub repository: upload the complete `images/players/` folder and replace `app.js`, `data.js`, `data.json` and `build_data.py`. To finish tidying, remove the old root-level `pfp-*.webp` images once the site is working.
