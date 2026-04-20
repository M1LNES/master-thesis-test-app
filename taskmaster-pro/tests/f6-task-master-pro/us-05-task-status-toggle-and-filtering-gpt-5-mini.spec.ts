/**
 * IMPLEMENTATION NOTES:
 * - [PASS] 1. Log in using `user@test.com` and `password123` — Login form exists and credentials navigate to /dashboard.
 * - [PASS] 2. Locate an active task and click its status checkbox — A task "Review related papers" with checkbox "Mark as done" exists and is clickable.
 * - [PASS] 3. Verify checkbox reflects checked state — After clicking, the checkbox becomes checked.
 * - [PASS] 4. Click the 'Active' filter button/radio — The 'Active' radio exists and can be selected.
 * - [FAIL] 5. Verify that the task you just marked as completed is no longer visible when 'Active' is selected — Observed: after marking the task completed and selecting 'Active', the completed task REMAINS visible. Expected: it should be hidden. (Possible implementation bug in filtering logic.)
 * - [PASS] 6. Click the 'Completed' filter button/radio — The 'Completed' radio exists and can be selected.
 * - [PASS] 7. Verify that the completed task is visible when 'Completed' is selected — Expected behavior asserted in test (see below).
 *
 * Notes:
 * - Because acceptance criterion #5 appears to contradict the live behavior (the app does not hide completed items when 'Active' is selected),
 *   the test below contains the EXPECTED assertions and is marked with `test.fail()` so the test run will indicate the known/future-fix expectation.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

test.describe('US-05 Task Status Toggle and Filtering', () => {
  test('should mark a task as completed and filter it out of Active then show it in Completed', async ({ page }: { page: import('@playwright/test').Page }) => {
    // Marking the test as expected-to-fail due to observed behavior:
    // After marking a task completed, selecting "Active" does NOT hide the completed task (observed during exploration).
    test.fail(true, 'Application currently shows completed tasks under Active filter; expected them to be hidden.');

    // 1) Log in
    await page.goto(baseUrl);
    // Wait for login form
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Locate the task heading and its checkbox (observed in the app)
    const taskHeading = page.getByRole('heading', { name: 'Review related papers' });
    const statusCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });

    // Ensure the task is visible before interacting
    await expect(taskHeading).toBeVisible();
    await expect(statusCheckbox).toBeVisible();

    // 2) Click the status checkbox to mark as completed
    await statusCheckbox.click();

    // 3) Verify checkbox is checked (task marked as completed)
    await expect(statusCheckbox).toBeChecked();

    // 4) Click the 'Active' filter button/radio
    const activeRadio = page.getByRole('radio', { name: 'Active' });
    await activeRadio.click();

    // 5) Verify the completed task is no longer visible in the task list.
    // Expected: taskHeading is not visible under Active filter.
    // NOTE: This is the acceptance criterion that appears to be broken in the live app
    // (during exploration the completed task remained visible under Active). The assertion
    // below reflects the expected behavior per the user story.
    await expect(taskHeading).not.toBeVisible({ timeout: 5000 });

    // 6) Click the 'Completed' filter button/radio
    const completedRadio = page.getByRole('radio', { name: 'Completed' });
    await completedRadio.click();

    // 7) Verify that the completed task is visible again in the list
    // Wait for the list to update and show the completed task
    await expect(taskHeading).toBeVisible({ timeout: 5000 });
  });
});