import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Admin can see 'Delete' button on all tasks.
 * - [PASS] AC_02: User can only see 'Delete' button on their own tasks.
 */

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should allow admin to see delete button on all tasks', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Verify 'Delete' button is visible on all tasks
    const tasks = await page.locator('div[role="region"][name="Task list"] > div');
    const taskCount = await tasks.count();
    for (let i = 0; i < taskCount; i++) {
      await expect(tasks.nth(i).getByRole('button', { name: 'Delete' })).toBeVisible();
    }
  });

  test('should restrict user to see delete button only on their own tasks', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Verify 'Delete' button is visible only on user's own tasks
    const tasks = await page.locator('div[role="region"][name="Task list"] > div');
    const taskCount = await tasks.count();
    for (let i = 0; i < taskCount; i++) {
      const ownerText = await tasks.nth(i).locator('text=Owner:').textContent();
      if (ownerText.includes('user@test.com')) {
        await expect(tasks.nth(i).getByRole('button', { name: 'Delete' })).toBeVisible();
      } else {
        await expect(tasks.nth(i).getByRole('button', { name: 'Delete' })).not.toBeVisible();
      }
    }
  });
});