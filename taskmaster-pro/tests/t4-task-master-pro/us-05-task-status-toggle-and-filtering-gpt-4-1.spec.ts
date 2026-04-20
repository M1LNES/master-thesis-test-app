/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in works and dashboard loads.
 * - [PASS] Can locate an active task and click its status checkbox.
 * - [PASS] Checkbox reflects checked state after marking as completed.
 * - [PASS] Can click 'Active' filter and it becomes checked.
 * - [FAIL] After marking a task as completed, switching to 'Active' filter does NOT remove the completed task from the list (the completed task is still visible).
 * - [FAIL] After marking a task as completed, switching to 'Completed' filter does NOT show the completed task (shows "No tasks found for this filter.").
 *
 * The filter functionality appears broken: completed tasks do not disappear from 'Active' nor appear in 'Completed'.
 * Tests for these criteria are marked with test.fail().
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should allow marking a task as completed and reflect checked state', async ({ page }) => {
    // 1. Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // 2. Locate an active task and click its status checkbox
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await expect(taskCheckbox).toBeVisible();
    await taskCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state
    await expect(taskCheckbox).toBeChecked();
  });

  test('should remove completed task from list when "Active" filter is selected', async ({ page }) => {
    test.fail(true, 'Completed tasks are not removed from the list when "Active" filter is selected (implementation bug).');

    // 1. Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // 2. Mark the task as completed
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await activeFilter.click();
    await expect(activeFilter).toBeChecked();

    // 5. Verify that the completed task is no longer visible
    await expect(page.getByRole('heading', { name: taskTitle })).not.toBeVisible();
  });

  test('should show completed task in list when "Completed" filter is selected', async ({ page }) => {
    test.fail(true, 'Completed tasks do not appear in the list when "Completed" filter is selected (implementation bug).');

    // 1. Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // 2. Mark the task as completed
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();

    // 6. Click the 'Completed' filter
    const completedFilter = page.getByRole('radio', { name: 'Completed' });
    await completedFilter.click();
    await expect(completedFilter).toBeChecked();

    // 7. Verify that the completed task is now visible in the list again
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
  });
});