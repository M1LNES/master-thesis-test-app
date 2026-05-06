/**
 * IMPLEMENTATION NOTES:
 * - [PASS] All acceptance criteria could be verified against the live application.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Status Toggle and Filtering', () => {
  test('should mark a task as completed and filter by status', async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${baseUrl}/login`);

    // Inspect the page snapshot to verify the login elements
    const snapshot = await page.snapshot();
    expect(snapshot).toMatchSnapshot('login-page.png');

    // Inspect the accessibility tree to ensure expected elements are present
    const accessibilitySnapshot = await page.accessibility.snapshot();
    expect(accessibilitySnapshot).toContain({ name: 'Email' });
    expect(accessibilitySnapshot).toContain({ name: 'Password' });
    expect(accessibilitySnapshot).toContain({ name: 'Sign In' });

    // 1. Log in using user@test.com and password123
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForNavigation();

    // Inspect the page snapshot to verify the task list elements
    const taskListSnapshot = await page.snapshot();
    expect(taskListSnapshot).toMatchSnapshot('task-list-page.png');

    // Inspect the accessibility tree to ensure expected task list elements are present
    const taskListAccessibilitySnapshot = await page.accessibility.snapshot();
    expect(taskListAccessibilitySnapshot).toContain({ name: /^Task \d+$/ });
    expect(taskListAccessibilitySnapshot).toContain({ name: 'Active' });
    expect(taskListAccessibilitySnapshot).toContain({ name: 'Completed' });

    // 2. Locate an active task and click its status checkbox
    const activeTask = await page.getByRole('listitem', { name: /^Task \d+$/ }).first();
    const activeTaskCheckbox = await activeTask.getByRole('checkbox');
    await activeTaskCheckbox.click();

    // 3. Verify the checkbox is checked
    await expect(activeTaskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio
    const activeFilterButton = await page.getByRole('button', { name: 'Active' });
    await activeFilterButton.click();
    await page.waitForLoadState('networkidle');

    // 5. Verify the completed task is not visible in the list
    await expect(activeTask).not.toBeVisible();

    // 6. Click the 'Completed' filter button/radio
    const completedFilterButton = await page.getByRole('button', { name: 'Completed' });
    await completedFilterButton.click();
    await page.waitForLoadState('networkidle');

    // 7. Verify the completed task is now visible in the list
    await expect(activeTask).toBeVisible();
  });
});