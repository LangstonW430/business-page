import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

console.log('[prerender] Building SSR bundle...');

await build({
  root,
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist/server',
    emptyOutDir: true,
    rollupOptions: {
      output: { format: 'esm' },
    },
  },
  logLevel: 'warn',
});

console.log('[prerender] Rendering to string...');

const { render } = await import(
  pathToFileURL(resolve(root, 'dist/server/entry-server.js')).href
);

const appHtml = render();

const indexPath = resolve(root, 'dist/index.html');
const template = readFileSync(indexPath, 'utf-8');
const result = template.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);

if (result === template) {
  throw new Error('Replacement failed — <div id="root"></div> not found in dist/index.html');
}

writeFileSync(indexPath, result, 'utf-8');
rmSync(resolve(root, 'dist/server'), { recursive: true });

console.log('[prerender] ✓ dist/index.html now contains fully rendered HTML');
