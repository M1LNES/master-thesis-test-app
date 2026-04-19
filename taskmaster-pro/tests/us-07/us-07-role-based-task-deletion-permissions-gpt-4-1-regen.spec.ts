/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): As admin, all tasks (owned by admin and user) are visible and each has a 'Delete' button.
 * - [PASS] AC_02 (User Restriction): As user, only the user's own task ("Review related papers" owned by user@test.com) is visible and has a 'Delete' button. Admin tasks are not present in the DOM for the user, so the restriction is enforced by task visibility.
 *
 * All selectors and UI structure have been verified using Playwright MCP tools.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should show Delete button on all tasks for admin', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Admin should see all tasks, each with a Delete button

    // Task: Prepare thesis proposal (admin-owned)
    const adminTask1 = page.getByRole('heading', { name: 'Prepare thesis proposal' }).locator('..').locator('..').locator('..');
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Task: Set up E2E baseline (admin-owned)
    const adminTask2 = page.getByRole('heading', { name: 'Set up E2E baseline' }).locator('..').locator('..').locator('..');
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Task: Review related papers (user-owned)
    const userTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..').locator('..').locator('..');
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('should only show Delete button on user\'s own tasks and not on admin tasks', async ({ page }) => {
    // Login as user
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // User should only see their own task: "Review related papers"
    const userTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..').locator('..').locator('..');
    await expect(userTask).toBeVisible();

    // The "Delete" button should be visible for the user's own task
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Admin tasks should not be present at all for the user
    await expect(page.getByRole('heading', { name: 'Prepare thesis proposal' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Set up E2E baseline' })).toHaveCount(0);

    // There should be no "Delete" button for admin tasks (since the tasks themselves are not present)
    await expect(page.getByRole('button', { name: 'Delete' }).filter({
      has: page.getByRole('heading', { name: 'Prepare thesis proposal' })
    })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete' }).filter({
      has: page.getByRole('heading', { name: 'Set up E2E baseline' })
    })).toHaveCount(0);
  });
});