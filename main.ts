const { cpSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } = require('node:fs');
const { join, relative } = require('node:path');

const root = __dirname;
const output = process.env.MAKEFUN_OUTPUT_DIR || join(root, 'out');
const appSource = join(root, 'app');
const appOutput = join(output, 'app');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    })
    .sort();
}

mkdirSync(output, { recursive: true });
cpSync(appSource, appOutput, { recursive: true });

const files = listFiles(appOutput).map((path) => ({
  path: relative(output, path).split('\\').join('/'),
  bytes: statSync(path).size,
}));
const data = JSON.parse(readFileSync(join(appOutput, 'data/trophies.json'), 'utf8'));

writeFileSync(join(output, 'dossier.json'), JSON.stringify({
  title: 'Leonida Ledger',
  competition: 'gta6-trophy-guide-01',
  format: 'offline-static-guide',
  summary: 'A locally served, fan-made GTA VI trophy planner with searchable entries and saved progress.',
  speculative: true,
  trophyCount: data.trophies.length,
  files,
}, null, 2) + '\n');

console.log(`Built ${files.length} offline app files and ${data.trophies.length} guide entries in ${output}`);
