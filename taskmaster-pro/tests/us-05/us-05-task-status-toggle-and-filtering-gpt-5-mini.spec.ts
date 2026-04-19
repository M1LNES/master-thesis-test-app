/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Login UI present and dashboard reachable. Observed login form with labels 'Email' and 'Password' and a 'Login' button. Dashboard shows after auth (has 'Task filters' group and 'Logout' button).
 * - [PASS] Criterion 2: Active task and its status checkbox exist. Observed a task titled "Review related papers" with a checkbox labeled "Mark as done".
 * - [PASS] Criterion 3: Checkbox state can be asserted (checked/unchecked).
 * - [PASS] Criterion 4: Filter radios 'All', 'Active', and 'Completed' exist.
 * - [PASS] Criterion 5 & 7: Filtering behavior can be asserted by waiting for the task to be hidden/shown after selecting filters.
 *
 * Notes: All acceptance criteria were observable in the test target during exploration. Tests below use only selectors that were verified (getByLabel, getByRole).
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('US-05 Task Status Toggle and Filtering', () => {
  test('should mark a task completed and filter it out from Active then show it under Completed', async ({ page }) => {
    // Navigate to the app
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // If we're on the login page, perform login. Otherwise assume already authenticated.
    if (page.url().includes('/login') || (await page.getByLabel('Email').count()) > 0) {
      // Fill credentials and sign in
      await page.getByLabel('Email').fill('user@test.com');
      await page.getByLabel('Password').fill('password123');
      await Promise.all([
        // Wait for either navigation or the dashboard task filters to appear
        page.waitForResponse((resp) => resp.url().includes('/api') || resp.status() < 600).catch(() => {}),
        page.getByRole('button', { name: 'Login' }).click(),
      ]);
      // Wait for dashboard UI to be present
      await page.getByRole('group', { name: 'Task filters' }).waitFor({ state: 'visible' });
    }

    // Ensure we are on the dashboard by checking for the Task filters group
    const filtersGroup = page.getByRole('group', { name: 'Task filters' });
    await expect(filtersGroup).toBeVisible();

    // Locate the task heading and the associated checkbox
    const taskTitle = page.getByRole('heading', { name: 'Review related papers' });
    await expect(taskTitle).toBeVisible();

    // Use the checkbox by its accessible name
    const checkbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(checkbox).toBeVisible();

    // Acceptance Criterion 2: Click the status checkbox for an active task
    // Ensure it is currently unchecked (active)
    await expect(checkbox).not.toBeChecked();
    await checkbox.click();

    // Acceptance Criterion 3: Verify the checkbox is checked (marked as completed)
    await expect(checkbox).toBeChecked();

    // Acceptance Criterion 4: Click the 'Active' filter radio
    const activeRadio = page.getByRole('radio', { name: 'Active' });
    await expect(activeRadio).toBeVisible();
    await activeRadio.click();

    // Acceptance Criterion 5: Verify the just-completed task is no longer visible in the task list
    // Wait for list to update: assert the task heading is hidden (toBeHidden will wait)
    await expect(taskTitle).toBeHidden();

    // Acceptance Criterion 6: Click the 'Completed' filter radio
    const completedRadio = page.getByRole('radio', { name: 'Completed' });
    await expect(completedRadio).toBeVisible();
    await completedRadio.click();

    // Acceptance Criterion 7: Verify that the completed task is visible again under Completed
    await expect(taskTitle).toBeVisible();
    // Also assert the checkbox is still checked when the task is visible under Completed
    await expect(checkbox).toBeChecked();
  });
});