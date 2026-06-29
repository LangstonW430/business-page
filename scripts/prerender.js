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
let result = template.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);

if (result === template) {
  throw new Error('Replacement failed — <div id="root"></div> not found in dist/index.html');
}

// ── Inject CMS-managed SEO meta from content.json ──────────────────────────
const { seo } = JSON.parse(
  readFileSync(resolve(root, 'src/data/content.json'), 'utf-8'),
);
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Replace the value of an attribute on a tag matched by `selector` (a unique
// substring identifying the tag, e.g. `name="description"`).
function setAttr(html, selector, attr, value) {
  // Find the single tag containing `selector`, then replace `attr`'s value
  // within just that tag. Splitting the work avoids a brittle all-in-one
  // regex that has to span arbitrary attribute order inside the tag.
  const sIdx = html.indexOf(selector);
  if (sIdx === -1) {
    throw new Error(`SEO injection failed — could not find ${selector}`);
  }
  const open = html.lastIndexOf('<', sIdx);
  const close = html.indexOf('>', sIdx);
  const tag = html.slice(open, close + 1);
  const re = new RegExp(`(\\b${attr}=")[^"]*(")`);
  if (!re.test(tag)) {
    throw new Error(`SEO injection failed — ${selector} has no ${attr} attribute`);
  }
  const newTag = tag.replace(re, `$1${esc(value)}$2`);
  return html.slice(0, open) + newTag + html.slice(close + 1);
}

result = result.replace(
  /<title>[^<]*<\/title>/,
  `<title>${esc(seo.title)}</title>`,
);
result = setAttr(result, 'name="description"', 'content', seo.description);
result = setAttr(result, 'name="author"', 'content', seo.author);
result = setAttr(result, 'name="theme-color"', 'content', seo.themeColor);
result = setAttr(result, 'rel="canonical"', 'href', seo.url);
result = setAttr(result, 'property="og:url"', 'content', seo.url);
result = setAttr(result, 'property="og:title"', 'content', seo.title);
result = setAttr(result, 'property="og:description"', 'content', seo.description);
result = setAttr(result, 'property="og:image"', 'content', seo.ogImage);
result = setAttr(result, 'property="og:site_name"', 'content', seo.siteName);
result = setAttr(result, 'name="twitter:title"', 'content', seo.title);
result = setAttr(result, 'name="twitter:description"', 'content', seo.description);
result = setAttr(result, 'name="twitter:image"', 'content', seo.ogImage);

writeFileSync(indexPath, result, 'utf-8');
rmSync(resolve(root, 'dist/server'), { recursive: true });

console.log('[prerender] ✓ dist/index.html now contains fully rendered HTML');
