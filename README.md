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
- The HBC Mixed Running on Prosecco match date and MOTM are still unconfirmed.
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
