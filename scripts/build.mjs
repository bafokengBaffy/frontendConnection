import { build } from 'esbuild';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const entryFile = path.join(srcDir, 'main.jsx');
const htmlTemplatePath = path.join(rootDir, 'index.html');

dotenv.config({ path: path.join(rootDir, '.env') });

const mode = process.env.VITE_APP_ENVIRONMENT || process.env.NODE_ENV || 'production';

const viteEnv = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
);

const importMetaEnv = {
  ...viteEnv,
  BASE_URL: './',
  DEV: false,
  PROD: true,
  MODE: mode,
  SSR: false,
};

const processEnv = {
  ...process.env,
  NODE_ENV: 'production',
};

const define = {
  'import.meta.env': JSON.stringify(importMetaEnv),
  'process.env': JSON.stringify(processEnv),
  'process.env.NODE_ENV': JSON.stringify('production'),
};

const loaders = {
  '.png': 'file',
  '.jpg': 'file',
  '.jpeg': 'file',
  '.gif': 'file',
  '.svg': 'file',
  '.webp': 'file',
  '.ico': 'file',
  '.woff': 'file',
  '.woff2': 'file',
  '.ttf': 'file',
  '.eot': 'file',
  '.otf': 'file',
  '.mp3': 'file',
};

async function emptyDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function copyPublicAssets(fromDir, toDir) {
  await fs.mkdir(toDir, { recursive: true });
  const entries = await fs.readdir(fromDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'index.html') {
      continue;
    }

    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      await copyPublicAssets(fromPath, toPath);
    } else {
      await fs.copyFile(fromPath, toPath);
    }
  }
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function normalizeOutputPath(outputPath) {
  return toPosix(path.relative(distDir, path.resolve(rootDir, outputPath)));
}

async function writeHtml({ jsFile, cssFile }) {
  let html = await fs.readFile(htmlTemplatePath, 'utf8');

  html = html.replace(
    /<script\s+type="module"\s+src="\/src\/main\.jsx"><\/script>/,
    `<script type="module" src="./${normalizeOutputPath(jsFile)}"></script>`
  );

  if (cssFile) {
    html = html.replace(
      '</head>',
      `    <link rel="stylesheet" href="./${normalizeOutputPath(cssFile)}" />\n  </head>`
    );
  }

  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8');
}

await emptyDir(distDir);
await copyPublicAssets(publicDir, distDir);

const result = await build({
  absWorkingDir: rootDir,
  entryPoints: [entryFile],
  outdir: distDir,
  bundle: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  metafile: true,
  loader: loaders,
  define,
  alias: {
    '@': srcDir,
  },
  entryNames: 'assets/[name]-[hash]',
  chunkNames: 'assets/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  logLevel: 'info',
});

const outputs = Object.entries(result.metafile.outputs);
const entryOutput = outputs.find(([, meta]) => meta.entryPoint === 'src/main.jsx');
const cssOutput = outputs.find(([file]) => file.endsWith('.css'));

if (!entryOutput) {
  throw new Error('Failed to locate bundled entry output for src/main.jsx');
}

await writeHtml({
  jsFile: entryOutput[0],
  cssFile: cssOutput?.[0] || null,
});

console.log(`Build complete: ${path.relative(rootDir, distDir)}`);
