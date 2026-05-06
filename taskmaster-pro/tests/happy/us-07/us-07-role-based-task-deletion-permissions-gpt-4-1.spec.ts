/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): As admin, all tasks (owned by admin and user) are visible and each has a 'Delete' button.
 * - [PASS] AC_02 (User Restriction): As user, only the user's own task ("Review related papers" owned by user@test.com) is visible and has a 'Delete' button. Tasks owned by admin are not visible to the user, so the absence of the 'Delete' button for admin-owned tasks is enforced by absence of the task itself.
 *
 * Observed: The dashboard for user@test.com only lists the user's own task, so the restriction is enforced at the task visibility level, not just the button.
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

    // There should be at least one task owned by admin and one by user
    const adminTask = page.getByRole('heading', { name: 'Prepare thesis proposal' }).locator('..').locator('..');
    const userTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..').locator('..');
    const adminTask2 = page.getByRole('heading', { name: 'Set up E2E baseline' }).locator('..').locator('..');

    // Admin's own task: should have Delete button
    await expect(adminTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    // User's task: should have Delete button
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    // Admin's second task: should have Delete button
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('should only show Delete button on user\'s own tasks and not on admin tasks', async ({ page }) => {
    // Login as user
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // User should only see their own task
    const userTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..').locator('..');
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Admin tasks should not be present at all
    await expect(page.getByRole('heading', { name: 'Prepare thesis proposal' }).locator('..').locator('..').getByRole('button', { name: 'Delete' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Set up E2E baseline' }).locator('..').locator('..').getByRole('button', { name: 'Delete' })).toHaveCount(0);

    // Additionally, ensure admin tasks are not present in the DOM
    await expect(page.getByRole('heading', { name: 'Prepare thesis proposal' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Set up E2E baseline' })).toHaveCount(0);
  });
});