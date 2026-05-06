/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login works with the provided credentials and redirects to dashboard.
 * - [PASS] Active task "Review related papers" is present with a "Mark as done" checkbox.
 * - [PASS] Clicking the checkbox marks the task as completed (checkbox becomes checked).
 * - [PASS] Clicking the 'Active' filter hides the completed task and shows "No tasks found for this filter."
 * - [PASS] Clicking the 'Completed' filter shows the completed task again with the checkbox checked.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should allow marking a task as completed and filter active/completed tasks correctly', async ({ page }) => {
    // 1. Log in
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Locate an active task and click its status checkbox
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await expect(taskCheckbox).not.toBeChecked();
    await taskCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify that the completed task is no longer visible in the task list
    // Wait for the list to update
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();
    await expect(page.getByRole('heading', { name: taskTitle })).not.toBeVisible();

    // 6. Click the 'Completed' filter button/radio
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify that the completed task is now visible in the list again
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    // The checkbox should still be checked
    const completedTaskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(completedTaskCheckbox).toBeChecked();
  });
});