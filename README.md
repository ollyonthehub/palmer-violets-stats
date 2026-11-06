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
- HBC Mixed Running on Prosecco took place on 16 October 2026 (same day as Rushed Intercourse); Cayden Steffener was MOTM.
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
- Running on Prosecco (Hibiscus Coast Mixed, 14–3) was played **16 October 2026**, the same day as Rushed Intercourse. Cayden Steffener was MOTM.
- Updating an existing GitHub repository: upload the complete `images/players/` folder and replace `app.js`, `data.js`, `data.json` and `build_data.py`. To finish tidying, remove the old root-level `pfp-*.webp` images once the site is working.

### V19 changes
The Overview, Records and 2026/27 leaderboards show the approved portrait from `images/players/`, or a lavender initials placeholder when no portrait exists, alongside player name and the relevant tally. The user-facing label for Joy Alinese is **Joy A.**; the canonical underlying name in the match data is preserved for historical continuity.


## 2026/27 MVP tracker (V21)

An **MVP vote is one point**, separate from the official Man of the Match award. On the 2026/27 page the chart combines **all competitions** irrespective of the selected competition filter, and plots cumulative points by match week. Only players with at least one recorded vote appear.

Vote data lives in `data.json` at `mvpVotesByMatch`, and in the corresponding `window.PV_DATA` assignment in `data.js`. Each key is a match ID (such as `26-1`) whose value maps player names to vote counts. A missing match key means voting has **not been supplied**, not zero votes.

Rushed Intercourse (16 October 2026): Connor Passingham 5, Fabiano Jesus 4, Cayden Steffener 2. Running on Prosecco votes have not yet been provided. The graph's y-axis automatically expands as cumulative votes increase, and future weekly data points append to each player's line.

The match detail page shows an additional MVP PTS column for 2026/27 only, and lists the vote recipients under Match details. Historical games retain their existing three-column line-ups.

## MVP vote breakdown (V22)

Directly below the full-width 2026/27 MVP line graph, a **Vote Breakdown** table lists every player with at least one MVP vote. Each row includes the player's portrait (or lavender initials fallback), plus votes received in **Warkworth Mixed**, **Hibiscus Coast Mens**, **Hibiscus Coast Mixed**, and the **Total** across all three competitions. Rows are ranked by total votes and can be selected to open the player profile.

Both the graph and table derive their points automatically from `mvpVotesByMatch`, so adding vote counts to a match in `data.json` and `data.js` updates both. The season's competition selector does not filter the MVP race. A dash indicates no vote **recorded** for that competition; matches with voting still pending remain uncounted. The table automatically grows as new vote recipients and match results are entered.

V22 changes only `app.js` and `style.css`; all 13 player image files and match data remain unchanged.

## Match-list MOTM portraits (V23)

Every completed match list now has the columns `DATE`, `OPPONENT`, `COMPETITION`, `MOTM`, `SCORE`. The new MOTM column uses the match record's official `players[].motm` value; it does **not** use cumulative MVP vote points. An award with no recorded recipient shows a dash, and one explicitly marked `motmStatus: 'unconfirmed'` displays `Pending`. If multiple players shared MOTM, their portraits appear together in the cell. Approved photos load from `images/players/`, while players without a photo show the usual lavender initials.

This applies consistently to the Overview recent results, 2026/27 results, Match archive, highest-scoring matches, opponent history and player match history. V23 requires updating only `app.js` and `style.css` from the V22 website; match stats and player image assets did not change.


## V25 — Player debut and 2026/27 shirt numbers

Player profiles now show the player's **club debut**, calculated from their earliest *dated* appearance in the full match archive, not from the current season/competition filter. When players have two games on the same day, the debut date is shared rather than guessing an earlier kick-off. The appearance date updates automatically when older matches are added.

The `shirtNumbersBySeason` object in `data.json` holds season-specific shirt numbers (currently 2026/27). Future seasons can be added as separate keys without overwriting history. The 2026/27 entries are Will Turner #1, Christian Collins #7, Cayden Steffener #11, Connagh Webb #14, Fabiano Jesus #20, William Healey #23, Connor Passingham #26, Oliver Graham #30, Max Boundy #49, Jamison Lawrence #56, Jesse Attwood #64 and Taj Oliver #99. Players without supplied shirt numbers show **Not recorded**.

To update from V24, replace `app.js`, `style.css`, `data.js`, `data.json` and `build_data.py`. `README.md` is updated documentation (optional).
