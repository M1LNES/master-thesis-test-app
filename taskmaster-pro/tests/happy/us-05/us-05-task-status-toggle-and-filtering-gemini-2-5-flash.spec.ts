/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Log in using `user@test.com` and `password123`.
 * - [PASS] Criterion 2: Locate an active task in the list and click its status checkbox.
 * - [PASS] Criterion 3: Verify that the checkbox reflects the checked state (marked as completed).
 * - [PASS] Criterion 4: Click the 'Active' filter button/radio.
 * - [PASS] Criterion 5: Verify that the task you just marked as completed is no longer visible in the task list.
 * - [PASS] Criterion 6: Click the 'Completed' filter button/radio.
 * - [PASS] Criterion 7: Verify that the completed task is now visible in the list again.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should mark task as completed and filter tasks correctly', async ({ page }) => {
    // 1. Log in using `user@test.com` and `password123`.
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Define task title to track
    const taskTitle = 'Review related papers';

    // 2. Locate an active task in the list and click its status checkbox.
    // Locate the task heading first, then find its parent container, and finally the checkbox within that container.
    const taskHeading = page.getByRole('heading', { name: taskTitle, level: 3 });
    const taskItemContainer = taskHeading.locator('xpath=ancestor::div[contains(@class, "flex flex-col")]').first();
    const checkboxLocator = taskItemContainer.getByRole('checkbox', { name: 'Mark as done' });

    await checkboxLocator.click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(checkboxLocator).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();
    // Wait for the list to update and the "No tasks found for this filter." message to appear.
    await page.getByText('No tasks found for this filter.').waitFor({ state: 'visible' });

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    await expect(taskHeading).not.toBeVisible();
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();
    // Wait for the list to update and the completed task to become visible again.
    await page.getByText(taskTitle).waitFor({ state: 'visible' });

    // 7. Verify that the completed task is now visible in the list again.
    await expect(taskHeading).toBeVisible();
    await expect(checkboxLocator).toBeChecked();
  });
});