import { expect, test, type Page } from '@playwright/test';
import { returning } from './helpers';

const field = (page: Page) => page.getByRole('textbox', { name: 'Add a task' });

async function addOne(page: Page, text: string) {
  await field(page).fill(text);
  await field(page).press('Enter');
  await field(page).press('Escape');
}

test.beforeEach(async ({ page }) => {
  await returning(page);
});

test('E edits the selected task in place, Enter saves and Z undoes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'a keyboard flow; the double click below covers touch-free editing');
  await addOne(page, 'Reply to the client');
  await page.keyboard.press('k');
  await page.keyboard.press('e');
  const edit = page.getByRole('textbox', { name: 'Edit: Reply to the client' });
  await expect(edit).toBeFocused();
  await expect(edit).toHaveValue('Reply to the client');
  await edit.fill('Reply to the client today');
  await edit.press('Enter');
  await expect(page.locator('.task-row')).toContainText(['Reply to the client today']);
  await page.keyboard.press('z');
  await expect(page.locator('.task-row')).toContainText(['Reply to the client']);
  await expect(page.locator('.task-row')).not.toContainText(['today']);
});

test('Esc puts the text back; a double click edits too and leaving the field saves', async ({ page }) => {
  await addOne(page, 'Book the dentist');
  await page.locator('.task-row').getByText('Book the dentist').dblclick();
  const edit = page.getByRole('textbox', { name: 'Edit: Book the dentist' });
  await edit.fill('Something else');
  await edit.press('Escape');
  await expect(page.locator('.task-row')).toContainText(['Book the dentist']);
  await page.locator('.task-row').getByText('Book the dentist').dblclick();
  await page.getByRole('textbox', { name: 'Edit: Book the dentist' }).fill('Book the dentist for Monday');
  await page.locator('header h1').click();
  await expect(page.locator('.task-row')).toContainText(['Book the dentist for Monday']);
});

test('an empty edit is refused and keeps the old text', async ({ page }) => {
  await addOne(page, 'Pay the rent');
  await page.locator('.task-row').getByText('Pay the rent').dblclick();
  const edit = page.getByRole('textbox', { name: 'Edit: Pay the rent' });
  await edit.fill('   ');
  await edit.press('Enter');
  await expect(page.locator('.task-row')).toContainText(['Pay the rent']);
});
