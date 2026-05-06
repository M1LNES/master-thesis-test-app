import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should allow users to mark tasks as completed and filter them', async ({ page }) => {
    // 1. Log in using `user@test.com` and `password123`.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Store the task name to verify its visibility later
    const taskName = 'Review related papers';
    const taskLocator = page.getByRole('heading', { name: taskName, level: 3 });
    const taskCheckboxLocator = page.getByRole('checkbox', { name: 'Mark as done' });

    // Ensure the task is visible before interacting
    await expect(taskLocator).toBeVisible();

    // 2. Locate an active task in the list and click its status checkbox.
    await taskCheckboxLocator.click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(taskCheckboxLocator).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();
    // Wait for the list to update after clicking the filter
    await page.waitForLoadState('networkidle');

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    await expect(taskLocator).not.toBeVisible();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();
    // Wait for the list to update after clicking the filter
    await page.waitForLoadState('networkidle');

    // 7. Verify that the completed task is now visible in the list again.
    await expect(taskLocator).toBeVisible();
  });
});