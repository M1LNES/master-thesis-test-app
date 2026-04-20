import { test, expect } from '@playwright/test';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with user@test.com and password123 works correctly
 * - [PASS] Task list displays with checkboxes for marking tasks as done
 * - [FAIL] Checkbox state persistence - clicking checkbox doesn't reliably persist completed state
 * - [FAIL] Filter functionality - completed tasks still show in "Active" filter and don't show in "Completed" filter
 * 
 * Tests marked with test.fail() represent expected behavior that is not currently working in the implementation.
 */

const baseUrl = 'http://localhost:3000?b=t4h9eu5m';

test.describe('Task Status Toggle and Filtering', () => {
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
    test.fail(); // Expected to fail due to checkbox state persistence issue
    
    // Locate an active task and get its title for later verification
    const taskHeading = page.getByRole('heading', { name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();
    
    // Click the checkbox to mark task as completed
    const checkbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await checkbox.click();
    
    // Verify the checkbox is checked
    await expect(checkbox).toBeChecked();
  });

  test('should filter out completed tasks when Active filter is selected', async ({ page }) => {
    test.fail(); // Expected to fail due to filter functionality issue
    
    // Get the task title before marking as completed
    const taskTitle = 'Review related papers';
    const taskHeading = page.getByRole('heading', { name: taskTitle });
    await expect(taskHeading).toBeVisible();
    
    // Mark the task as completed
    const checkbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Click the Active filter
    await page.getByRole('radio', { name: 'Active' }).click();
    
    // Wait for the task list to update
    await page.waitForTimeout(500);
    
    // Verify the completed task is no longer visible
    await expect(taskHeading).not.toBeVisible();
  });

  test('should show completed tasks when Completed filter is selected', async ({ page }) => {
    test.fail(); // Expected to fail due to filter functionality issue
    
    // Get the task title
    const taskTitle = 'Review related papers';
    const taskHeading = page.getByRole('heading', { name: taskTitle });
    
    // Mark the task as completed
    const checkbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Click the Completed filter
    await page.getByRole('radio', { name: 'Completed' }).click();
    
    // Wait for the task list to update
    await page.waitForTimeout(500);
    
    // Verify the completed task is now visible
    await expect(taskHeading).toBeVisible();
    await expect(checkbox).toBeChecked();
  });

  test('should complete full workflow: mark task, verify in Active filter, then verify in Completed filter', async ({ page }) => {
    test.fail(); // Expected to fail due to checkbox and filter functionality issues
    
    const taskTitle = 'Review related papers';
    const taskHeading = page.getByRole('heading', { name: taskTitle });
    const checkbox = page.getByRole('checkbox', { name: 'Mark as done' });
    
    // Step 1: Verify task is initially visible and unchecked
    await expect(taskHeading).toBeVisible();
    await expect(checkbox).not.toBeChecked();
    
    // Step 2: Mark task as completed
    await checkbox.click();
    
    // Step 3: Verify checkbox is checked
    await expect(checkbox).toBeChecked();
    
    // Step 4: Click Active filter
    await page.getByRole('radio', { name: 'Active' }).click();
    await page.waitForTimeout(500);
    
    // Step 5: Verify completed task is NOT visible in Active filter
    await expect(taskHeading).not.toBeVisible();
    
    // Step 6: Click Completed filter
    await page.getByRole('radio', { name: 'Completed' }).click();
    await page.waitForTimeout(500);
    
    // Step 7: Verify completed task IS visible in Completed filter
    await expect(taskHeading).toBeVisible();
    await expect(checkbox).toBeChecked();
  });
});