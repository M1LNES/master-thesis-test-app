import { test, expect } from '@playwright/test';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login functionality works correctly
 * - [PASS] Task list is present with filter options
 * - [PASS] Task checkbox and filter interactions appear functional
 */

const baseUrl = 'http://localhost:3000';

test.describe('Task Status and Filtering', () => {
  test('should toggle task status and filter tasks correctly', async ({ page }) => {
    // Navigate and login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("TaskMaster Pro")');

    // Find the first task's checkbox and title
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    const taskTitle = page.getByRole('heading', { level: 3 }).first();
    const originalTaskTitle = await taskTitle.textContent() || '';

    // Ensure the task is not already completed
    if (await taskCheckbox.isChecked()) {
      // If already checked, uncheck first
      await taskCheckbox.click();
    }

    // Click the checkbox to mark as completed
    await taskCheckbox.click();

    // Verify checkbox is checked
    await expect(taskCheckbox).toBeChecked();

    // Click 'Active' filter
    await page.getByRole('radio', { name: 'Active' }).click();

    // Wait for list to update and verify completed task is not in active list
    await page.waitForSelector('h3');
    const activeTaskTitles = await page.getByRole('heading', { level: 3 }).allTextContents();
    expect(activeTaskTitles).not.toContain(originalTaskTitle);

    // Click 'Completed' filter
    await page.getByRole('radio', { name: 'Completed' }).click();

    // Wait for list to update and verify completed task is now visible
    await page.waitForSelector('h3');
    const completedTaskTitles = await page.getByRole('heading', { level: 3 }).allTextContents();
    expect(completedTaskTitles).toContain(originalTaskTitle);
  });
});