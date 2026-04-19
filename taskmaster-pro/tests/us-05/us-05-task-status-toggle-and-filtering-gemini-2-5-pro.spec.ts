import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should allow toggling task status and filtering tasks accordingly', async ({ page }) => {
    // 1. Log in using user@test.com and password123.
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Define a locator for the task we are going to interact with.
    // This makes the test more readable and easier to maintain.
    const taskTitle = 'Review related papers';
    const taskLocator = page.getByRole('region', { name: 'Task list' }).locator('div').filter({ hasText: taskTitle }).first();

    // 2. Locate an active task in the list and click its status checkbox.
    const taskCheckbox = taskLocator.getByLabel('Mark as done');
    await taskCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    // We expect the specific task to be hidden.
    await expect(taskLocator).not.toBeVisible();
    // It's also good practice to check for the "No tasks" message, confirming the list is empty.
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify that the completed task is now visible in the list again.
    await expect(taskLocator).toBeVisible();
    // Also, verify the checkbox is still in the checked state.
    await expect(taskCheckbox).toBeChecked();
  });
});