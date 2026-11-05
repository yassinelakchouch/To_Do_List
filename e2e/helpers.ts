import type { Page } from '@playwright/test';
import { FRESH } from '../src/core/store';
import { KEY, VERSION } from '../src/core/storage';

// A returning visitor: onboarding already done, an empty list, the loader already seen this visit.
export async function returning(page: Page, name = '') {
  await page.goto('/');
  await page.evaluate(
    ({ key, saved }) => {
      localStorage.clear();
      localStorage.setItem(key, saved);
      sessionStorage.setItem('todo-project003:loaded', '1');
    },
    { key: KEY, saved: JSON.stringify({ version: VERSION, state: { ...FRESH, settings: { ...FRESH.settings, name, onboarded: true } } }) },
  );
  await page.reload();
}

// A first visit: nothing saved, the loader not seen yet.
export async function firstVisit(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
}
