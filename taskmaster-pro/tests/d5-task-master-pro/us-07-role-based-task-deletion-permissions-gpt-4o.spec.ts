/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Admin can see 'Delete' button on all tasks.
 * - [FAIL] AC_02: User cannot see 'Delete' button on tasks owned by others. The 'Delete' button is missing entirely for user-owned tasks.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should allow admin to see "Delete" button on all tasks', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL('**/dashboard');
    const tasks = await page.locator('div[role="region"][name="Task list"] > div');
    const taskCount = await tasks.count();

    for (let i = 0; i < taskCount; i++) {
      const task = tasks.nth(i);
      await expect(task.getByRole('button', { name: 'Delete' })).toBeVisible();
    }
  });

  test.fail('should restrict user from seeing "Delete" button on tasks not owned by them', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL('**/dashboard');
    const tasks = await page.locator('div[role="region"][name="Task list"] > div');
    const taskCount = await tasks.count();

    for (let i = 0; i < taskCount; i++) {
      const task = tasks.nth(i);
      const ownerText = await task.locator('text=Owner:').textContent();
      if (ownerText.includes('user@test.com')) {
        await expect(task.getByRole('button', { name: 'Delete' })).toBeVisible();
      } else {
        await expect(task.getByRole('button', { name: 'Delete' })).not.toBeVisible();
      }
    }
  });
});