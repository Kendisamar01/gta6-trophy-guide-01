# Vice City Field Notes

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kendisamar01/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kendisamar01/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

[Bounty page](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A self-contained web page for tracking a made-up set of GTA VI trophies. The 70 entries live in the repo as data; each has a title, a grade, a category, a requirement, an estimated rarity, and an optional tip that stays hidden until you ask for it. Checking entries off updates a completion meter, and the resulting log is kept in the browser or moved between devices as a JSON file. Every name and requirement is invented for this project, so treat the guide as fiction rather than a source of facts about Rockstar's game.

Entry on [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · [leaderboard](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)

## Getting started

Use Node.js 22 or later. There is no dependency manifest and nothing to install; both entrypoints rely only on modules bundled with Node.

```sh
node main.ts   # assemble a deployable copy in out/
node serve.ts  # preview the app on localhost
```

Then visit http://127.0.0.1:8080. The preview server reads the files in `app/` directly, so building is not required for it. `serve.ts` accepts `--port 3000` or a `PORT` environment variable if 8080 is taken, and it binds only to loopback.

`main.ts` is the packaging step for submission or hosting: it checks that the expected inputs are present, creates the target directory, and copies `app/` together with `shots.json` and `shots.mjs` into it. By default the target is `out/`; set `MAKEFUN_OUTPUT_DIR` to put it somewhere else. Nothing is transpiled or minified — the browser loads the JavaScript and JSON files as-is, and the finished page never calls a remote API or CDN.

## What is in the page

- A progress panel with a count, a percentage, and a bar, plus buttons for downloading or uploading a log.
- A search box, grade and category dropdowns, a reset button, and a switch that reveals the tips.
- A card per trophy with a checkbox-like control, badges for grade and category, the requirement text, the hidden tip, and a five-segment rarity indicator derived from the stored percentage.
- A counter showing how many entries survive the current filters and an empty-state message when none do.

Grades cover platinum through bronze; categories cover story, exploration, skill, collection, online, and misc. Searching looks at the name, requirement, tip, and category of each entry.

## Saving progress

A versioned JSON record is written to `localStorage` under `vice-city-field-notes.progress.v1` whenever an entry is toggled or an import is accepted. On load, and again for uploaded files, the code checks the format version, requires a list of string IDs, and silently discards IDs that do not match an entry in the current catalogue. Malformed stored data produces a warning in the page instead of crashing it. Exports download as `vice-city-field-notes-progress.json`.

## Source files

| File | Purpose |
| --- | --- |
| `main.ts` | Build entrypoint that validates inputs and copies the site and shot manifest into the output directory. |
| `serve.ts` | Minimal localhost static file server for development; handles GET/HEAD, sets content types, blocks paths outside `app/`, and disables caching. |
| `app/index.html` | Page structure and the controls the scripts attach to. |
| `app/app.js` | Application controller: loads saved progress, listens for user actions, recalculates the view, and handles check-offs and log transfer. |
| `app/ui.js` | Rendering layer that filters the catalogue, builds the trophy cards and rarity meters, and updates the progress display and status messages. |
| `app/store.js` | Persistence layer for reading, writing, validating, importing, and downloading the progress record. |
| `app/data/trophies.json` | The catalogue itself: 70 fictional entries, including one platinum, four gold, ten silver, and 55 bronze. |
| `app/data/trophies.js` | Loads that JSON, enforces count, uniqueness, and field rules, and exports a frozen list for the rest of the app. |
| `app/style.css` | Layout, colors, and responsive styling for the single page. |
| `shots.json`, `shots.mjs` | An empty screenshot manifest and the validator that checks its shape; both are carried into the build. |

The shipped output directory is generated and ignored by Git, so edits belong in `app/` or in one of the two root-level entrypoints.
