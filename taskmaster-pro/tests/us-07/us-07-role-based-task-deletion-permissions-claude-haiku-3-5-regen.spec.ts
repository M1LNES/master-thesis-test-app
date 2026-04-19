import { test, expect } from '@playwright/test';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Admin can see delete buttons on all tasks
 * - [PASS] User can only see delete button on own tasks
 */
test.describe('Role-Based Task Deletion Permissions', () => {
  const baseUrl = 'http://localhost:3000';
  const adminEmail = 'admin@test.com';
  const userEmail = 'user@test.com';
  const password = 'password123';

  async function loginAndNavigateToDashboard(page, email: string) {
    await page.goto(`${baseUrl}/login`);
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  }

  test('Admin should see delete buttons on all tasks', async ({ page }) => {
    await loginAndNavigateToDashboard(page, adminEmail);

    // Find all tasks with admin ownership
    const adminTasks = page.locator('text=Owner: admin@test.com');
    await expect(adminTasks).toHaveCount(2);

    // Check delete buttons on admin's tasks
    const adminTaskDeleteButtons = page.locator('text=Owner: admin@test.com').locator('xpath=../following-sibling::*').locator('button:has-text("Delete")');
    await expect(adminTaskDeleteButtons).toHaveCount(2);

    // Check delete buttons on user's tasks
    const userTaskDeleteButtons = page.locator('text=Owner: user@test.com').locator('xpath=../following-sibling::*').locator('button:has-text("Delete")');
    await expect(userTaskDeleteButtons).toHaveCount(1);
  });

  test('User should only see delete buttons on own tasks', async ({ page }) => {
    await loginAndNavigateToDashboard(page, userEmail);

    // Check delete buttons on user's tasks
    const userTaskDeleteButtons = page.locator('text=Owner: user@test.com').locator('xpath=../following-sibling::*').locator('button:has-text("Delete")');
    await expect(userTaskDeleteButtons).toHaveCount(1);

    // Check absence of delete buttons on admin's tasks
    const adminTaskDeleteButtons = page.locator('text=Owner: admin@test.com').locator('xpath=../following-sibling::*').locator('button:has-text("Delete")');
    await expect(adminTaskDeleteButtons).toHaveCount(0);
  });
});