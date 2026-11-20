# Vice City Field Notes

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Kendisamar01/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Kendisamar01/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline-first, fan-made trophy ledger for a hypothetical GTA VI completion run. Browse 64 original trophy concepts, search and filter by grade or activity, reveal optional field tips, and keep progress in local browser storage with JSON import/export. Names, requirements, and rarity percentages are community-made estimates, not official game information.

## Run locally

Requires Node.js 22 or newer and no installed packages:

```sh
node main.ts
node serve.ts
```

Open <http://127.0.0.1:8080>. The build is written to `out/`; set `MAKEFUN_OUTPUT_DIR` to use another destination. The app itself makes no external requests and needs only the local server to load its modules and data.
