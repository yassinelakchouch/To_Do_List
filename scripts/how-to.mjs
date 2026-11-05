// Records the onboarding's how-to loop from the real app: frames to scripts/frames/, then `python scripts/encode-how-to.py`
// turns them into public/how-to.webp (and a GIF fallback). Run with the dev server up: npm run dev, then node scripts/how-to.mjs
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const OUT = fileURLToPath(new URL('./frames/', import.meta.url));
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 960, height: 360 }, deviceScaleFactor: 1 });
await page.goto('http://localhost:5182/');
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.setItem('todo-project003:loaded', '1');
});
await page.reload();
await page.evaluate(() => document.fonts.ready);
// The loop shows the list itself: the phone tab bar and the challenge under the list stay out of the picture.
await page.addStyleTag({ content: '.tab-bar, #challenge-below { display: none !important; }' });

let n = 0;
const frame = async (hold = 1) => {
  for (let i = 0; i < hold; i += 1) await page.screenshot({ path: `${OUT}${String((n += 1)).padStart(3, '0')}.png` });
};
const field = page.getByRole('textbox', { name: 'Add a task' });

await frame(4);
await field.focus();
for (const ch of 'Write the case study') {
  await page.keyboard.type(ch);
  if (ch === ' ' || Math.random() < 0.3) await frame();
}
await frame(3);
await field.press('Tab');
await frame(3);
await field.press('Tab');
await frame(5);
await field.press('Enter');
await frame(4);
for (const ch of 'Buy coffee beans') {
  await page.keyboard.type(ch);
  if (ch === ' ') await frame();
}
await field.press('Enter');
await frame(4);
await field.press('Escape');
await page.keyboard.press('k');
await frame(4);
await page.keyboard.press('x');
await page.waitForTimeout(120);
await frame(10);
console.log(`${n} frames`);
await browser.close();
