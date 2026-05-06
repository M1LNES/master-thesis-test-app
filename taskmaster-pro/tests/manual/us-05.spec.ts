import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
  await expect(page.getByText('Summarize 5 papers and')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Mark as done' }).click();
  await page.getByRole('radio', { name: 'Active' }).check();

  // Manual assertions to verify that the elements are no longer visible
  await expect(page.getByRole('heading', { name: 'Review related papers' })).not.toBeVisible();
  await expect(page.getByText('Summarize 5 papers and')).not.toBeVisible();


  await page.getByRole('radio', { name: 'Completed' }).check();

  await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
  await expect(page.getByText('Summarize 5 papers and')).toBeVisible();
});