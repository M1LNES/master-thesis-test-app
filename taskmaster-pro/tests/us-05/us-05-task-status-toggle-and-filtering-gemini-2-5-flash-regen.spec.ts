import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should allow user to mark tasks as completed and filter them', async ({ page }) => {
    // 1. Log in using `user@test.com` and `password123`.
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Locate an active task in the list and click its status checkbox.
    const taskTitle = 'Review related papers';
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await taskCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();
    await page.waitForSelector('text=No tasks found for this filter.'); // Wait for the list to update

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    await expect(page.getByRole('heading', { name: taskTitle })).not.toBeVisible();
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();
    await page.waitForSelector(`h3:has-text("${taskTitle}")`); // Wait for the list to update

    // 7. Verify that the completed task is now visible in the list again.
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
    await expect(taskCheckbox).toBeChecked(); // Ensure the checkbox is still checked in the completed view
  });
});