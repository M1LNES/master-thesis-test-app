import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with valid credentials navigates to dashboard
 * - [PASS] Toggling a task checkbox marks it as completed (checkbox reflects checked state)
 * - [PASS] 'Active' filter hides the completed task
 * - [PASS] 'Completed' filter shows the completed task again
 * - [PASS] Assertions wait for list updates via expect auto-wait on locators
 */

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should hide completed task from Active filter and show it in Completed filter when toggled done', async ({ page }) => {
    // 1. Log in using valid credentials
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Ensure task list is present and capture the first task title for later assertions
    const taskList = page.getByRole('region', { name: 'Task list' });
    const firstTaskHeading = taskList.getByRole('heading', { level: 3 }).first();
    await expect(firstTaskHeading).toBeVisible();
    const taskTitle = (await firstTaskHeading.textContent())?.trim() || '';
    expect(taskTitle).toBeTruthy();

    // 2. Locate an active task and click its status checkbox
    const firstTaskCheckbox = taskList.getByRole('checkbox', { name: 'Mark as done' }).first();

    // 3. Verify that the checkbox reflects the checked state (marked as completed)
    await expect(firstTaskCheckbox).not.toBeChecked();
    await firstTaskCheckbox.click();
    await expect(firstTaskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter
    await page.getByRole('radio', { name: 'Active' }).click();
    // 5. Verify the completed task is no longer visible
    // Wait for the list to update by asserting the task heading count becomes 0
    await expect(taskList.getByRole('heading', { name: taskTitle })).toHaveCount(0);

    // 6. Click the 'Completed' filter
    await page.getByRole('radio', { name: 'Completed' }).click();
    // 7. Verify that the completed task is visible again
    await expect(taskList.getByRole('heading', { name: taskTitle })).toBeVisible();
  });
});