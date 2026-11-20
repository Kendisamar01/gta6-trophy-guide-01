import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? join(projectRoot, 'out');
const appDirectory = join(projectRoot, 'app');
const imageDirectory = join(projectRoot, 'screenshots');
const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

mkdirSync(outputDirectory, { recursive: true });
cpSync(appDirectory, join(outputDirectory, 'app'), { recursive: true });
mkdirSync(join(outputDirectory, 'screenshots'), { recursive: true });
if (existsSync(imageDirectory)) {
  cpSync(imageDirectory, join(outputDirectory, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(outputDirectory, 'dossier.json'),
  buildDossier(outputDirectory, dossierLimits),
);
