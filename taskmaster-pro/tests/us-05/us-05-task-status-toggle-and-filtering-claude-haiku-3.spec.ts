import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should mark a task as completed and filter by status', async ({ page }) => {
    // 1. Log in using user@test.com and password123
    await page.goto(`${baseUrl}/login`);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. Locate an active task and click its status checkbox
    const activeTask = await page.getByRole('listitem', { name: /^Task \d+$/ }).first();
    const activeTaskCheckbox = await activeTask.getByRole('checkbox');
    await activeTaskCheckbox.click();

    // 3. Verify the checkbox is checked
    await expect(activeTaskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio
    const activeFilterButton = await page.getByRole('button', { name: 'Active' });
    await expect(activeFilterButton).toBeVisible();
    await activeFilterButton.click();

    // 5. Verify the completed task is not visible in the list
    await expect(activeTask).not.toBeVisible();

    // 6. Click the 'Completed' filter button/radio
    const completedFilterButton = await page.getByRole('button', { name: 'Completed' });
    await expect(completedFilterButton).toBeVisible();
    await completedFilterButton.click();

    // 7. Verify the completed task is visible in the list
    await expect(activeTask).toBeVisible();
  });
});