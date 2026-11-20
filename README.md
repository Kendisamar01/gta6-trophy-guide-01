[![make.fun entry: GTA VI Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01)](https://make.fun/competitions/gta6-trophy-guide-01?repo=https%3A%2F%2Fgithub.com%2FKendisamar01%2Fgta6-trophy-guide-01)

# Leonida Trophy Atlas

A locally saved, fan-made trophy roadmap concept for *Grand Theft Auto VI*. Browse 68 original milestones by category, search descriptions and hints, sort by estimated rarity, and keep a checklist in your browser. The set and its rarity figures are speculative community writing, not an official or verified trophy list.

## Run locally

Requires Node.js 22 or newer and no package installation.

```sh
node main.ts
node serve.ts
```

Open <http://127.0.0.1:8080>. The guide is plain HTML, CSS, JavaScript, and JSON served from `app/`; it makes no network requests and saves progress only in the current browser's local storage. To use another port, run `node serve.ts --port 8081`. The build can be placed elsewhere with `MAKEFUN_OUTPUT_DIR=/path/to/output node main.ts`.

The capture plan in `shots.json` can be checked with `node shots.mjs`.
