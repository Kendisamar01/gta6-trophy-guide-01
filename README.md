# Vice City Field Notes

[![make.fun · gta6-trophy-guide-01](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-47a789?style=for-the-badge)](https://make.fun/competitions/gta6-trophy-guide-01)
[![GitHub repository](https://img.shields.io/badge/GitHub-Kendisamar01%2Fgta6--trophy--guide--01-20232a?logo=github&style=for-the-badge)](https://github.com/Kendisamar01/gta6-trophy-guide-01)

An offline-first, fan-made trophy ledger for a hypothetical GTA VI completion run. Browse 64 original trophy concepts, search and filter by grade or activity, reveal optional field tips, and keep progress in local browser storage with JSON import/export. Names, requirements, and rarity percentages are community-made estimates, not official game information.

## Run locally

Requires Node.js 22 or newer and no installed packages:

```sh
node main.ts
node serve.ts
```

Open <http://127.0.0.1:8080>. The build is written to `out/`; set `MAKEFUN_OUTPUT_DIR` to use another destination. The app itself makes no external requests and needs only the local server to load its modules and data.
