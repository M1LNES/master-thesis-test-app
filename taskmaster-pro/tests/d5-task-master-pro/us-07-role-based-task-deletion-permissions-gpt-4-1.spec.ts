/**
 * IMPLEMENTATION NOTES:
 * - [FAIL] AC_01 (Admin Access): As admin, there is NO 'Delete' button visible on any task (only 'Edit' is present). Expected: 'Delete' button on all tasks.
 * - [FAIL] AC_02 (User Restriction): As user, there is NO 'Delete' button visible on any task (only 'Edit' is present). Expected: 'Delete' button only on user's own tasks, and strictly NOT on others'.
 * - Both criteria appear to be unimplemented or missing in the UI. Tests are written as expected and marked with test.fail().
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {
  test('should show Delete button on all tasks for admin', async ({ page }) => {
    test.fail(true, 'Delete button is not present for any task as admin (implementation missing)');
    // Login as admin
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Find all tasks and assert 'Delete' button is present for each
    const taskOwners = await page.locator('text=Owner:').allTextContents();
    const taskCards = await page.locator('text=Owner:').locator('..').locator('..').elementHandles();

    for (const card of taskCards) {
      // 'Delete' button should be present
      const deleteBtn = await card.$('button:has-text("Delete")');
      expect(deleteBtn, 'Delete button should be present for every task as admin').not.toBeNull();
    }
  });

  test('should only show Delete button on user\'s own tasks, and not on others', async ({ page }) => {
    test.fail(true, 'Delete button is not present for any task as user (implementation missing)');
    // Login as user
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Find all tasks and check ownership
    const taskCards = await page.locator('text=Owner:').locator('..').locator('..').elementHandles();

    for (const card of taskCards) {
      const ownerText = await card.$eval('text=Owner:', el => el.textContent || '');
      const isMine = ownerText.includes('user@test.com');
      const deleteBtn = await card.$('button:has-text("Delete")');
      if (isMine) {
        expect(deleteBtn, 'Delete button should be present on user\'s own tasks').not.toBeNull();
      } else {
        expect(deleteBtn, 'Delete button should NOT be present on tasks not owned by user').toBeNull();
      }
    }
  });
});