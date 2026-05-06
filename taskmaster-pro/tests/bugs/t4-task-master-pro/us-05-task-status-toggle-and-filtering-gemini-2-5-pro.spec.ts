/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC-1: User can successfully log in.
 * - [PASS] AC-2: User can locate an active task and click its status checkbox.
 * - [PASS] AC-3: The checkbox state correctly reflects being checked after the click.
 * - [FAIL] AC-5: After clicking the 'Active' filter, the task marked as completed was expected to be hidden, but it remained visible. This suggests a bug in the 'Active' filter logic.
 * - [FAIL] AC-7: After clicking the 'Completed' filter, the task marked as completed was expected to be visible, but the list was empty ("No tasks found for this filter."). This suggests a bug in the 'Completed' filter logic.
 *
 * Based on these failures, the test case covering the filtering logic is marked with `test.fail()`.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should allow toggling task status and filtering the task list', async ({ page }) => {
    // Because the filtering functionality is broken, we expect this test to fail.
    // If the bugs are fixed, Playwright will report this as an "unexpected pass".
    test.fail();

    await page.goto(baseUrl);

    // 1. Log in using user@test.com and password123.
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Define a locator for a specific task to make the test more robust
    const taskToComplete = page.getByRole('article').filter({ hasText: 'Review related papers' });

    // 2. Locate an active task in the list and click its status checkbox.
    await taskToComplete.getByLabel('Mark as done').click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(taskToComplete.getByLabel('Mark as done')).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    // This is expected to fail based on manual exploration.
    await expect(taskToComplete).not.toBeVisible();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify that the completed task is now visible in the list again.
    // This is also expected to fail based on manual exploration.
    await expect(taskToComplete).toBeVisible();
  });
});