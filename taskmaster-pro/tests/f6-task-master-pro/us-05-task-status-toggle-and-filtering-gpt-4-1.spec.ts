/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in works with 'user@test.com' and 'password123'
 * - [PASS] Can locate an active task ("Review related papers") and click its status checkbox
 * - [PASS] Checkbox reflects checked state after marking as completed
 * - [PASS] Clicking 'Active' filter hides the completed task from the list
 * - [PASS] Clicking 'Completed' filter shows the completed task in the list again
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should allow marking a task as completed and filter active/completed tasks', async ({ page }) => {
    // 1. Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Locate an active task and click its status checkbox
    // We'll use the task "Review related papers" as observed
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await expect(taskCheckbox).not.toBeChecked();
    await taskCheckbox.click();

    // 3. Verify checkbox is checked (marked as completed)
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify the completed task is no longer visible in the task list
    // Wait for the list to update
    await expect(page.getByRole('heading', { name: taskTitle })).toBeHidden();

    // 6. Click the 'Completed' filter
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify the completed task is now visible in the list again
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Mark as done' })).toBeChecked();
  });
});