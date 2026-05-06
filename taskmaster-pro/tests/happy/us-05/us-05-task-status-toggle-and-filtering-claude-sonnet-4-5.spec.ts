import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] All acceptance criteria verified and working correctly
 * - Login functionality works as expected
 * - Task status toggle (checkbox) works correctly
 * - Filter functionality (All/Active/Completed) works as expected
 * - Task list updates properly when filters are applied
 */

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should mark task as completed and verify checkbox state', async ({ page }) => {
    // Locate an active task - "Test Active Task"
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    await expect(taskHeading).toBeVisible();
    
    // Find the checkbox for this task (it should be unchecked initially)
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(taskCheckbox).not.toBeChecked();
    
    // Click the checkbox to mark the task as completed
    await taskCheckbox.click();
    
    // Verify that the checkbox reflects the checked state
    await expect(taskCheckbox).toBeChecked();
  });

  test('should filter tasks correctly when Active filter is selected', async ({ page }) => {
    // First, mark an active task as completed
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    await expect(taskHeading).toBeVisible();
    
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();
    
    // Click the 'Active' filter button
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await activeFilter.click();
    
    // Wait for the list to update
    await expect(activeFilter).toBeChecked();
    
    // Verify that the completed task is no longer visible
    await expect(taskHeading).not.toBeVisible();
    
    // Verify the "No tasks found" message is displayed
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();
  });

  test('should show completed task when Completed filter is selected', async ({ page }) => {
    // First, mark an active task as completed
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    await expect(taskHeading).toBeVisible();
    
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();
    
    // Click the 'Active' filter to hide the completed task
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await activeFilter.click();
    await expect(activeFilter).toBeChecked();
    
    // Verify task is not visible in Active filter
    await expect(taskHeading).not.toBeVisible();
    
    // Click the 'Completed' filter button
    const completedFilter = page.getByRole('radio', { name: 'Completed' });
    await completedFilter.click();
    
    // Wait for the list to update
    await expect(completedFilter).toBeChecked();
    
    // Verify that the completed task is now visible again
    await expect(taskHeading).toBeVisible();
    
    // Verify the checkbox is still checked
    const completedTaskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(completedTaskCheckbox).toBeChecked();
  });

  test('should complete full workflow: mark task, filter active, filter completed', async ({ page }) => {
    // AC1: Already logged in via beforeEach
    
    // AC2: Locate an active task and click its status checkbox
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    await expect(taskHeading).toBeVisible();
    
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await taskCheckbox.click();
    
    // AC3: Verify that the checkbox reflects the checked state
    await expect(taskCheckbox).toBeChecked();
    
    // AC4: Click the 'Active' filter button
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await activeFilter.click();
    
    // Wait for the list to update
    await expect(activeFilter).toBeChecked();
    
    // AC5: Verify that the task is no longer visible in the task list
    await expect(taskHeading).not.toBeVisible();
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();
    
    // AC6: Click the 'Completed' filter button
    const completedFilter = page.getByRole('radio', { name: 'Completed' });
    await completedFilter.click();
    
    // Wait for the list to update
    await expect(completedFilter).toBeChecked();
    
    // AC7: Verify that the completed task is now visible in the list again
    await expect(taskHeading).toBeVisible();
    
    // Additional verification: checkbox should still be checked
    const completedTaskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    await expect(completedTaskCheckbox).toBeChecked();
  });

  test('should toggle task back to active state', async ({ page }) => {
    // Mark a task as completed
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();
    
    // Uncheck the task to make it active again
    await taskCheckbox.click();
    await expect(taskCheckbox).not.toBeChecked();
    
    // Filter by Active
    const activeFilter = page.getByRole('radio', { name: 'Active' });
    await activeFilter.click();
    await expect(activeFilter).toBeChecked();
    
    // Task should be visible in Active filter
    await expect(taskHeading).toBeVisible();
    
    // Filter by Completed
    const completedFilter = page.getByRole('radio', { name: 'Completed' });
    await completedFilter.click();
    await expect(completedFilter).toBeChecked();
    
    // Task should not be visible in Completed filter
    await expect(taskHeading).not.toBeVisible();
  });

  test('should show all tasks when All filter is selected', async ({ page }) => {
    // Mark a task as completed
    const taskHeading = page.getByRole('heading', { name: 'Test Active Task', level: 3 });
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    
    await taskCheckbox.click();
    await expect(taskCheckbox).toBeChecked();
    
    // Click the 'All' filter (should be selected by default, but click to ensure)
    const allFilter = page.getByRole('radio', { name: 'All' });
    await allFilter.click();
    await expect(allFilter).toBeChecked();
    
    // Both completed and active tasks should be visible
    await expect(taskHeading).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review related papers', level: 3 })).toBeVisible();
  });
});