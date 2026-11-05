import { expect, test } from '@playwright/test';
import { returning } from './helpers';

test('Sunday weeks start on the next Sunday; until then this week runs to Saturday', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-11T10:00:00') });
  await returning(page);
  await expect(page.getByText('ends Sun 15').locator('visible=true')).toBeVisible();
  await page.getByRole('button', { name: 'Settings' }).click();
  const weekStarts = page.getByRole('group', { name: 'Week starts' });
  await weekStarts.getByRole('button', { name: 'Sunday' }).click();
  await expect(weekStarts.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('dialog', { name: 'Settings' })).toContainText('Sunday weeks start Sun 15; this week runs to Sat 14.');
  await page.keyboard.press('Escape');
  await expect(page.getByText('ends Sat 14').locator('visible=true')).toBeVisible();

  await page.clock.setSystemTime(new Date('2026-11-15T10:00:00'));
  await page.reload();
  await expect(page.getByText('ends Sat 21').locator('visible=true')).toBeVisible();
  await page.goto('/#/career');
  await expect(page.locator('.week-chart').locator('visible=true').first()).toHaveAttribute('aria-label', /^This week: S 0, M 0/);
});
