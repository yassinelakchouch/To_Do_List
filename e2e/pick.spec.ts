import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });
const slot = (page: Page) => page.getByRole('dialog', { name: 'Pick for me' });

async function add(page: Page, ...texts: string[]) {
  for (const text of texts) {
    await field(page).fill(text);
    await field(page).press('Enter');
  }
  await field(page).press('Escape');
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await returning(page);
});

test('Can’t choose? spins, lands on an open task, and Start it selects its row', async ({ page }) => {
  await add(page, 'Buy coffee beans', 'Gym · legs', 'Renew the domain');
  await page.locator('[data-pick-open]').locator('visible=true').click();
  const start = slot(page).getByRole('button', { name: 'Start it ↵' });
  await expect(start).toBeVisible();
  const said = (await slot(page).locator('[data-pick-said]').textContent())!.replace('Picked: ', '');
  expect(['Buy coffee beans', 'Gym · legs', 'Renew the domain']).toContain(said);
  await start.click();
  await expect(slot(page)).toHaveCount(0);
  await expect(page.locator('.task-row[data-state="selected"]')).toContainText(said);
});

test('P opens it, P again lands somewhere else, Esc closes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard flow');
  await add(page, 'One', 'Two');
  await page.keyboard.press('p');
  await expect(slot(page).getByRole('button', { name: 'Start it ↵' })).toBeFocused();
  const first = await slot(page).locator('[data-pick-said]').textContent();
  await page.keyboard.press('p');
  await expect(slot(page).locator('[data-pick-said]')).not.toHaveText(first!);
  await expect(slot(page).locator('[data-pick-said]')).toHaveText(/Picked: (One|Two)/);
  await page.keyboard.press('Escape');
  await expect(slot(page)).toHaveCount(0);
});

test('with nothing open, it asks for a task first', async ({ page }) => {
  await page.locator('[data-pick-open]').locator('visible=true').click();
  await expect(slot(page)).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Add a task first');
});
