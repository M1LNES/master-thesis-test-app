import { test, expect } from '@playwright/test';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Admin can see delete buttons on all tasks
 * - [PASS] User can only see delete buttons on their own tasks
 */
test.describe('Role-Based Task Deletion Permissions', () => {
  const baseUrl = 'http://localhost:3000?b=c2n7zr8p';
  const adminEmail = 'admin@test.com';
  const userEmail = 'user@test.com';
  const password = 'password123';

  async function loginAndNavigateToDashboard(page, email: string) {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  }

  test('Admin should see delete buttons on all tasks', async ({ page }) => {
    await loginAndNavigateToDashboard(page, adminEmail);

    // Check tasks owned by admin
    const adminTasks = page.locator('text="Owner: admin@test.com"').locator('xpath=../following-sibling::*');
    const adminTaskDeleteButtons = adminTasks.getByRole('button', { name: 'Delete' });
    await expect(adminTaskDeleteButtons).toHaveCount(2);

    // Check tasks owned by user
    const userTasks = page.locator('text="Owner: user@test.com"').locator('xpath=../following-sibling::*');
    const userTaskDeleteButtons = userTasks.getByRole('button', { name: 'Delete' });
    await expect(userTaskDeleteButtons).toHaveCount(1);
  });

  test('User should only see delete buttons on their own tasks', async ({ page }) => {
    await loginAndNavigateToDashboard(page, userEmail);

    // Check tasks owned by user
    const userTasks = page.locator('text="Owner: user@test.com"').locator('xpath=../following-sibling::*');
    const userTaskDeleteButtons = userTasks.getByRole('button', { name: 'Delete' });
    await expect(userTaskDeleteButtons).toHaveCount(1);

    // Check tasks owned by admin
    const adminTasks = page.locator('text="Owner: admin@test.com"').locator('xpath=../following-sibling::*');
    const adminTaskDeleteButtons = adminTasks.getByRole('button', { name: 'Delete' });
    await expect(adminTaskDeleteButtons).toHaveCount(0);
  });
});