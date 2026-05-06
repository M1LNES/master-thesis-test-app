/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Able to log in with user@test.com/password123 and reach Dashboard
 * - [PASS] 'Active' and 'Completed' filter radios are present and clickable
 * - [FAIL] After clicking the task's "Mark as done" checkbox, the checkbox does not become checked
 * - [FAIL] Filtering does not reflect completion: after marking as done, task still appears under 'Active', and 'Completed' shows "No tasks found"
 *   -> The flow for toggling completion and filtering by completion status appears not implemented or broken.
 */

import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('[US-05] Task Status Toggle and Filtering', () => {

  test('should log in and display dashboard with task filters and task list', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Verify filters are present
    await expect(page.getByRole('radio', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Active' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Completed' })).toBeVisible();

    // Verify task list region is present and has at least one task
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();
    const firstTaskHeading = taskList.getByRole('heading', { level: 3 }).first();
    await expect(firstTaskHeading).toBeVisible();
  });

  test('should mark task as completed and filter accordingly', async ({ page }) => {
    // Expected to fail due to current implementation not updating checkbox/filters
    test.fail(true, 'Mark-as-done does not toggle checked state; filters do not reflect completion.');

    // 1. Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // Capture the first active task's title for later verification
    const firstTaskHeading = taskList.getByRole('heading', { level: 3 }).first();
    const firstTaskTitle = (await firstTaskHeading.innerText()).trim();
    expect(firstTaskTitle.length).toBeGreaterThan(0);

    // 2. Locate an active task and click its status checkbox
    const statusCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(statusCheckbox).toBeVisible();
    await statusCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state
    await expect(statusCheckbox).toBeChecked();

    // 4. Click the 'Active' filter
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify the just-completed task is no longer visible in the task list
    // Wait for list to update by expecting the specific task title to be absent
    await expect(taskList.getByRole('heading', { name: firstTaskTitle })).toHaveCount(0);

    // 6. Click the 'Completed' filter
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify the completed task is now visible again
    await expect(taskList.getByRole('heading', { name: firstTaskTitle })).toBeVisible();
  });

});