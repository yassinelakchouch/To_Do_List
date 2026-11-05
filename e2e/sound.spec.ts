import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

// A stand-in AudioContext that writes down each tone, so the flow can hear what plays.
async function listen(page: Page) {
  await page.addInitScript(() => {
    const tones: number[] = ((window as unknown as { tones: number[] }).tones = []);
    const param = () => ({ setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} });
    class Fake {
      state = 'running';
      currentTime = 0;
      destination = {};
      resume() {}
      createGain() {
        return { gain: param(), connect: (to: unknown) => to };
      }
      createOscillator() {
        return { type: '', frequency: { ...param(), setValueAtTime: (f: number) => tones.push(f) }, connect: (to: unknown) => to, start() {}, stop() {} };
      }
    }
    (window as unknown as { AudioContext: unknown }).AudioContext = Fake;
  });
}

const tones = (page: Page) => page.evaluate(() => (window as unknown as { tones: number[] }).tones);

test.beforeEach(async ({ page }) => {
  await listen(page);
  await returning(page);
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Water the plants');
  await field.press('Enter');
});

test('a tick plays a bright tick', async ({ page }) => {
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect.poll(() => tones(page)).toEqual([1320]);
});

test('with Sound off, a tick is silent', async ({ page }) => {
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('group', { name: 'Sound' }).getByRole('button', { name: 'Off' }).click();
  await page.getByRole('button', { name: 'Close · Esc' }).click();
  await page.getByRole('button', { name: 'Mark done: Water the plants' }).click();
  await expect(page.getByRole('status')).toContainText('Done · Water the plants');
  expect(await tones(page)).toEqual([]);
});
