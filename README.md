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

Current upcoming fixtures (16 November 2026): four fixtures on 17 and 20 November. The 13 November matches have been completed, and the previously cancelled 6 November fixtures were removed.


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


## 2026/27 MVP tracker (updated V29)

**MVP voting applies only to 2026/27 Hibiscus Coast Mens matches.** Every vote cast for MOTM is one MVP point. The official MOTM award is tracked separately. In Warkworth Mixed and Hibiscus Coast Mixed, one MOTM winner is selected but **no voting points exist**. Never label a Mixed fixture as awaiting MVP votes.

The full-width cumulative MVP line graph on the 2026/27 page shows **Men's competition votes only**, irrespective of the selected competition filter. Only players with at least one vote appear. The chart auto-scales as points increase and groups vote totals by match week.

Votes are stored by Men's match ID under `mvpVotesByMatch` in `data.json` and `data.js`. For a Men's match, a missing entry means votes have not been reported (pending); a missing entry for a Mixed match is expected and not pending. Current records:

- 16 October 2026, Rushed Intercourse: Connor Passingham 5, Fabiano Jesus 4, Cayden Steffener 2.
- 13 November 2026, Optimate Me: Christian Collins 5, Cayden Steffener 5, William Healey 1, Connor Passingham 1.

Men's match details display the fourth `MVP PTS` line-up column and a vote summary. Mixed and historical match details display the original three columns (PLAYER, GOALS, MOTM), with no voting message. The official MOTM trophy remains counted normally across all competitions.

### Vote Breakdown table (formerly V22)

The competition-by-competition Vote Breakdown table has been **removed** at the user's request in V29. The cumulative chart, player portraits and its legend remain. The voting data itself has been retained, so a breakdown can be reintroduced later if desired.

## Match-list MOTM portraits (V23)

Every completed match list now has the columns `DATE`, `OPPONENT`, `COMPETITION`, `MOTM`, `SCORE`. The new MOTM column uses the match record's official `players[].motm` value; it does **not** use cumulative MVP vote points. An award with no recorded recipient shows a dash, and one explicitly marked `motmStatus: 'unconfirmed'` displays `Pending`. If multiple players shared MOTM, their portraits appear together in the cell. Approved photos load from `images/players/`, while players without a photo show the usual lavender initials.

This applies consistently to the Overview recent results, 2026/27 results, Match archive, highest-scoring matches, opponent history and player match history. V23 requires updating only `app.js` and `style.css` from the V22 website; match stats and player image assets did not change.


## V25 — Player debut and 2026/27 shirt numbers

Player profiles now show the player's **club debut**, calculated from their earliest *dated* appearance in the full match archive, not from the current season/competition filter. When players have two games on the same day, the debut date is shared rather than guessing an earlier kick-off. The appearance date updates automatically when older matches are added.

The `shirtNumbersBySeason` object in `data.json` holds season-specific shirt numbers (currently 2026/27). Future seasons can be added as separate keys without overwriting history. The 2026/27 entries are Will Turner #1, Christian Collins #7, Cayden Steffener #11, Connagh Webb #14, Fabiano Jesus #20, William Healey #23, Connor Passingham #26, Oliver Graham #30, Max Boundy #49, Jamison Lawrence #56, Jesse Attwood #64 and Taj Oliver #99. Players without supplied shirt numbers show **Not recorded**.

To update from V24, replace `app.js`, `style.css`, `data.js`, `data.json` and `build_data.py`. `README.md` is updated documentation (optional).


## V26 — 2026/27 illustrated squad shirts

The player profile now shows a small illustrated **back of the 2026/27 Palmer Violets kit** with the relevant squad number, and the season label **2026/27** beneath it. This replaces the text-only shirt-number display. The illustration is derived from the user's approved 14-shirt composite; names, sponsors and extraneous text are not part of the individual graphics. Each shirt is a separate transparent WebP in `images/shirts/2026-27/` to avoid fetching the full composite per player.

Added **Blake Boundy #27** and **Tom Barnett #8** to the season-specific mapping. Existing twelve numbers and all historical match records remain as before. If a player has no 2026/27 number recorded, the profile continues to indicate that no number has been recorded.

**GitHub update from V25:** replace `app.js`, `style.css`, `data.js`, and `data.json`; upload the whole new `images/shirts/2026-27/` folder (14 WebP files). `README.md` is documentation only. No changes to the player portraits or match stats.


## V28 — Week 2 2026/27 results (13 November 2026)

Two fixtures from the prior upcoming schedule are now completed and recorded as `26-3` and `26-4`. Upcoming entries for 13 November were removed.

- **Hibiscus Coast Mixed vs West Orewa Knights:** 5–0 win; 9 players; goals Cayden Steffener ×3, Max Boundy ×1, Taj Oliver ×1. Cayden official MOTM. As a Mixed match, no MVP vote points are awarded; `26-3` correctly has no entry in `mvpVotesByMatch`.
- **Hibiscus Coast Mens vs Optimate Me:** 12–1 win; 9 players; goals Cayden ×4, Oliver Graham ×3, Christian Collins ×3, Connor Passingham ×1, Taj Oliver ×1. MVP votes Christian ×5, Cayden ×5, William Healey ×1, Connor ×1 (12 total). Christian and Cayden were equal leading vote recipients and both have `motm:1` for the match (shared MOTM).
- Original scorer shorthand **“Cp x1”** has been expanded to **Connor Passingham ×1**.
- All player appearances, goals and awards derive from the two new match entries and update existing leaderboards, player profiles, match archive, Records and current-season statistics automatically. The MVP chart derives from the Men’s fixtures in `mvpVotesByMatch`.
- Source builder `build_data.py` updated to preserve these 2026/27 results on data regeneration (requires the original historical XLSX inputs).

**GitHub update from V27:** Replace `data.json`, `data.js` and `app.js` (the latter removes an outdated “two fixtures so far” sentence on the Seasons page). Update `build_data.py` too if you retain the source builder in your repository. No image, HTML or stylesheet change is required.

## V29 — Men's-only MVP voting; breakdown removed

The 2026/27 MVP chart is now labelled HBC Men’s only. The competition breakdown table is removed; the chart and legend are retained. Only Men's matches display MVP points in line-ups, and Mixed match pages never show “votes pending”. The existing 23 points remain unchanged. See the MVP tracker section above for the rules.

**GitHub update from V28:** replace `app.js`, `style.css`, `data.js`, `data.json`, and optionally `README.md`. No images or `build_data.py` changes are required.


## V31 — Week 2 appearance corrections (15 November 2026)

- **HBC Mixed vs West Orewa Knights (`26-3`)**: Jamison Lawrence did **not** appear; Sofia Barnett **did** appear. Corrected total: **9** player appearances. No goals or MOTM changes.
- **HBC Mens vs Optimate Me (`26-4`)**: Jamison Lawrence did **not** appear. Corrected total: **8** player appearances. No goals, MOTM, or MVP vote changes.
- **Sofia Barnett** is the confirmed spelling, replacing the original `Sophia Barnett` in the 16 October Running on Prosecco match (`26-2`) so her two appearances aggregate under one player.
- **Jamison Lawrence** now has 1 HBC Men’s and 1 HBC Mixed appearance in 2026/27 (2 total), both from Week 1. His 2 goals remain from Running on Prosecco.
- **Deploy from V30:** Replace `data.js` and `data.json`. Update `build_data.py` as well to preserve these corrections when regenerating the database. No `app.js`, `style.css`, player portraits, or shirt graphics need changing.


## V32 — 2026/27 Week 3 upcoming fixtures (16 November 2026)

- **Tuesday 17 November · Shoesmith Domain · Warkworth Mixed:** vs Shoesmith United (5:45pm) and Wirtz Case Scenario (6:30pm).
- **Friday 20 November · Stanmore Bay Park:** HBC Mens vs Real Mid (6:00pm) and HBC Mixed vs Bare Biscuits (6:45pm).
- The 2026/27 page shows the four fixtures with their date, venue and kick-off. Fixtures are read-only and do not count towards recorded stats until results are supplied.
- **Deploy from V31:** replace `data.json`, `data.js`, `app.js` and `style.css`. `README.md` is optional. Existing portraits, shirt illustrations, recorded results, MVP votes and awards remain intact.


## V33 — Full Warkworth Mixed schedule and fixture fields (16 November 2026)

The upcoming fixtures database includes all **13** Warkworth Mixed fixtures from the
club's supplied Shoesmith Domain schedule (17 November 2026–19 January 2027).
Each includes an exact kickoff time and field label (`SF1`–`SF7`).

The two 20 November Hibiscus Coast fixtures were first retained without field numbers in V33.
Those field numbers, plus an additional 27 November Mixed fixture, were verified
against the screenshots in V34.

Fixture head-to-head cards now recognise confirmed 2026/27 rebrands:
- `Keep Fat '26` refers to the historical `Keep Fat` opponent.
- `Oysters` refers to the historical `Matakana FC` opponent.

Past match results and the historical displayed opponent names are unchanged.
When recording a future result against these teams, use the existing historical
`opponentId` to preserve combined head-to-head records. All existing match data,
player statistics, awards and MVP voting remain unchanged.


## V34 — HBC fixture times and fields (16 November 2026)

The two user-supplied Hibiscus Coast screenshots confirm the following **Palmer Violets** fixtures at Stanmore Bay Park:

| Date | Competition | Opponent | Kickoff | Field |
|---|---|---|---|---|
| 20 November 2026 | Hibiscus Coast Mens | Real Mid | 6:00pm | 4B |
| 20 November 2026 | Hibiscus Coast Mixed | Bare Biscuits | 6:45pm | 2B |
| 27 November 2026 | Hibiscus Coast Mixed | Coastie Sevens | 6:00pm | 2B |

The unrelated HBC Mixed matches shown in the schedule screenshot were intentionally excluded.
All **13** Warkworth Mixed fixtures from V33 are preserved unchanged, giving **16** upcoming fixtures total.
The V33 fixture-card implementation already displays the venue, kickoff and field; no application/style updates are necessary.
The 38-match archive, player stats, awards and 23 recorded MVP votes are unchanged.


## One-day tournament support (V36)

Tournament records are listed in `data.json` under `tournaments` and mirrored in `data.js`.
Each entry can contain: `id` (stable slug), `name` (distinct competition name), `shortName`,
`season`, `date`, `location`, `venue`, `format`, and `notes`. The `#tournaments` page
lists each event, and `#tournaments/<id>` is its dedicated page.

When its schedule is known, add normal items to `upcomingFixtures` using:
- `tournamentId`: the exact event `id`
- `competition`: the exact tournament `name`
- `season`, `date`, `opponent`, `kickoff`, `field`, `venue` (as available)

As results arrive, remove played upcoming fixtures and add standard match records to
`matches` with the SAME `tournamentId`, event `name` as `competition`, and the usual
`season`, `phase` (e.g. Group or Knockout), `date`, `opponent`, `gf`, `ga`, `players`
(with `goals` and `motm`), and optional `ownGoals`. Existing match pages, all-time
leaderboards, goal droughts, seasonal totals, and player profiles all include these
matches automatically and exactly once. Every tournament remains separately
filterable by event name, with a combined Tournaments category for convenience.

No tournament match should be added to `mvpVotesByMatch`: the MVP vote race is
exclusively for Hibiscus Coast Mens fixtures. Tournament MOTM awards count as
ordinary MOTM honours when confirmed.

**First registered event:** Football Fix Albany Summer Tournament 2026,
28 November 2026. Opponents, times, format and results not yet provided.

**Rebuild note:** `build_data.py` preserves newer-season match records and `tournaments`
when rebuilding from the historic audit spreadsheets. Always edit `data.json` and
regenerate `data.js` together.
