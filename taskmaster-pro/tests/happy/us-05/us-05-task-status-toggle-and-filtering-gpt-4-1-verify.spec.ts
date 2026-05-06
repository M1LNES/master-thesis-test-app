import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in using `user@test.com` and `password123`.
 * - [PASS] Locate an active task in the list and click its status checkbox.
 * - [PASS] Verify that the checkbox reflects the checked state (marked as completed).
 * - [PASS] Click the 'Active' filter button/radio.
 * - [PASS] Verify that the task you just marked as completed is no longer visible in the task list.
 * - [PASS] Click the 'Completed' filter button/radio.
 * - [PASS] Verify that the completed task is now visible in the list again.
 */

test.describe('Task Status Toggle and Filtering', () => {
  test('should mark a task as completed and filter tasks correctly', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Locate and mark the task as completed
    await page.getByRole('checkbox', { name: 'Mark as done' }).click();
    await expect(page.getByRole('checkbox', { name: 'Mark as done' })).toBeChecked();

    // Filter active tasks and verify the completed task is not visible
    await page.getByRole('radio', { name: 'Active' }).click();
    await expect(page.locator('text=No tasks found for this filter.')).toBeVisible();

    // Filter completed tasks and verify the completed task is visible
    await page.getByRole('radio', { name: 'Completed' }).click();
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
  });
});