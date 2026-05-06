/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Login using `user@test.com` / `password123` navigates to /dashboard.
 * - [PASS] Criterion 2: An active task "Review related papers" is present and has a checkbox labeled "Mark as done".
 * - [PASS] Criterion 3: Clicking the checkbox marks it as checked.
 * - [PASS] Criterion 4: 'Active' filter radio exists and is clickable.
 * - [PASS] Criterion 5: After selecting 'Active', the completed task is no longer visible.
 * - [PASS] Criterion 6: 'Completed' filter radio exists and is clickable.
 * - [PASS] Criterion 7: After selecting 'Completed', the completed task is visible again.
 *
 * Notes:
 * - Observations were made against the live app at the provided baseUrl.
 * - All selectors used are accessible roles/labels discovered during exploration.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('US-05 Task Status Toggle and Filtering', () => {
  test('should mark an active task as completed and filter it out from Active and back into Completed', async ({ page }) => {
    // 1) Log in
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // wait for dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Locate the specific task and its checkbox (criteria 2 & 3)
    const taskHeading = page.getByRole('heading', { name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();

    const statusCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    // Confirm initial state is unchecked (we observed this in exploration). If the app differs, this assertion will reflect actual state.
    await expect(statusCheckbox).not.toBeChecked();

    // Click the task's status checkbox to mark as completed
    await statusCheckbox.click();

    // Verify checkbox reflects checked state (criterion 3)
    await expect(statusCheckbox).toBeChecked();

    // Click the 'Active' filter radio (criterion 4)
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await expect(activeFilter).toBeVisible();
    await activeFilter.click();

    // Wait for the list to update and verify the task is no longer visible (criterion 5)
    // Use Playwright's expect which auto-waits for the condition to be met.
    await expect(taskHeading).not.toBeVisible();

    // Click the 'Completed' filter radio (criterion 6)
    const completedFilter = page.getByRole('radio', { name: 'Completed' });
    await expect(completedFilter).toBeVisible();
    await completedFilter.click();

    // Wait for the list to update and verify the completed task is visible again (criterion 7)
    await expect(taskHeading).toBeVisible();
  });
});