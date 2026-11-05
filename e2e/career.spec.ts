import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test('Career shows the league, the track, every quest, the podium and the week', async ({ page }) => {
  await returning(page, 'Yassine');
  const field = page.getByRole('textbox', { name: 'Add a task' });
  await field.fill('Write the case study');
  await field.press('Tab');
  await field.press('Tab');
  await field.press('Enter');
  await page.getByRole('button', { name: 'Mark done: Write the case study' }).click();
  await page.goto('/#/career');
  await expect(page.getByRole('heading', { name: 'Rookie, chapter 1' })).toBeVisible();
  await expect(page.locator('.career header p')).toHaveText('945 XP to Starter');
  await expect(page.locator('.career-track').locator('visible=true')).toHaveAttribute('aria-label', 'Rookie, 55 XP, 945 to Starter');
  await expect(page.locator('.quest-card')).toHaveCount(4);
  await expect(page.getByRole('img', { name: /Best days: 1\. .+, 30 sparks/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /This week:/ })).toBeVisible();
});
