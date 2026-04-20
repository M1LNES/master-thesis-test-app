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

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('Task Status Toggle and Filtering', () => {
  test('should mark a task as completed and filter tasks correctly', async ({ page }) => {
    // Step 1: Log in
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Step 2: Locate an active task and mark it as completed
    await page.getByRole('checkbox', { name: 'Mark as done' }).click();
    await expect(page.getByRole('checkbox', { name: 'Mark as done' })).toBeChecked();

    // Step 3: Filter active tasks
    await page.getByRole('radio', { name: 'Active' }).click();
    await page.waitForSelector('text=No tasks found for this filter.');
    await expect(page.locator('text=Review related papers')).not.toBeVisible();

    // Step 4: Filter completed tasks
    await page.getByRole('radio', { name: 'Completed' }).click();
    await page.waitForSelector('text=Review related papers');
    await expect(page.locator('text=Review related papers')).toBeVisible();
  });
});