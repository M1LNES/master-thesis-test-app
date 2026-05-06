import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeEmpty();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('janochmi@students.zcu.cz');
  await page.getByRole('button', { name: 'Login' }).click();

  // Manual workaround - could not be done via the Playwright VSC extension
  // This is not a DOM element, but a browser validation message, so we need to check for the invalid input
  await expect(page.locator('input:invalid')).toHaveCount(1);

  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('neplatneheslo');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Invalid credentials')).toBeVisible();
});