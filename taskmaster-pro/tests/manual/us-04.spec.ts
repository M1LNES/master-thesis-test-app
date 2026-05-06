import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByRole('button', { name: 'Save Task' }).click();

  // Manual workaround - the field validation message is not visible in DOM,
  // so we need to check for the invalid input
  await expect(page.locator('input:invalid')).toHaveCount(1);

  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Save Task' }).click();

  // Verify that the exact text "Test TaskHighNo description" is visible in the task list
  // there can be multiple tasks, so we need to ensure we are checking for the correct one
  await expect(page.getByText('Test TaskHighNo description')).toBeVisible();

  // Manual workaround - the "exact: true" is needed
  // Without it, it can match fuzzy/partial text and cause false positives
  await expect(page.getByText('Task created successfully', { exact: true })).toBeVisible();
});