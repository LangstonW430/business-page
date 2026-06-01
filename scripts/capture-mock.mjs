import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const URL = 'https://mock-bakery.langstonwoods.com/';
const RAW_PATH = resolve(ROOT, 'public/screenshots/mock-bakery-mobile-raw.png');
const OUT_PATH = resolve(ROOT, 'public/screenshots/mock-bakery-mobile.webp');

mkdirSync(dirname(OUT_PATH), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

const page = await context.newPage();
console.log(`Navigating to ${URL} …`);
await page.goto(URL, { waitUntil: 'load', timeout: 30_000 });
// let lazy images / web fonts finish rendering
await page.waitForTimeout(2_000);

console.log('Capturing full-page screenshot …');
await page.screenshot({ path: RAW_PATH, fullPage: true });
await browser.close();

const rawSize = statSync(RAW_PATH).size;
console.log(`Raw PNG: ${(rawSize / 1024).toFixed(1)} KB  →  ${RAW_PATH}`);

console.log('Resizing to 600 px wide and encoding as WebP …');
await sharp(RAW_PATH)
  .resize({ width: 600 })
  .webp({ quality: 80 })
  .toFile(OUT_PATH);

const outSize = statSync(OUT_PATH).size;
console.log(`Final WebP: ${(outSize / 1024).toFixed(1)} KB  →  ${OUT_PATH}`);

if (outSize < 200 * 1024) {
  console.log('✓ Under 200 KB target.');
} else {
  console.warn('⚠ Exceeds 200 KB — consider lowering quality or trimming content.');
}
