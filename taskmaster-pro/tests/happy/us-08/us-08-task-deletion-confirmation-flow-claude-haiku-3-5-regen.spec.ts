/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login functionality works correctly
 * - [PASS] Dashboard loads with tasks
 * - [PASS] Delete button exists for tasks
 * - [PASS] Task list is visible
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Deletion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Ensure at least one task exists for testing
    const taskCount = await page.locator('[data-testid="task-item"]').count();
    if (taskCount === 0) {
      // Create a task if none exist
      await page.getByRole('button', { name: 'New Task' }).click();
      await page.getByRole('textbox', { name: 'Title' }).fill('Test Task for Deletion');
      await page.getByRole('button', { name: 'Save' }).click();
    }
  });

  test('should display confirmation dialog when deleting a task', async ({ page }) => {
    // Find the first task's delete button
    const deleteButton = page.locator('[data-testid="task-delete-btn"]').first();
    
    // Click delete button
    await deleteButton.click();
    
    // Verify confirmation dialog appears
    const confirmDialog = page.getByRole('dialog', { name: /Delete task/i });
    await expect(confirmDialog).toBeVisible();
    
    // Optional: Verify cancel button exists
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('should remove task and show success toast after confirmation', async ({ page }) => {
    // Store initial task count
    const initialTasks = await page.locator('[data-testid="task-item"]').count();
    
    // Find the first task's delete button and task title
    const deleteButton = page.locator('[data-testid="task-delete-btn"]').first();
    const taskTitle = await page.locator('[data-testid="task-title"]').first().textContent();
    
    // Click delete button
    await deleteButton.click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /Confirm|Delete/i }).click();
    
    // Wait for potential animations or async operations
    await page.waitForTimeout(500);
    
    // Verify task is removed
    await expect(page.getByText(taskTitle || '')).toHaveCount(0);
    
    // Verify task count decreased
    const remainingTasks = await page.locator('[data-testid="task-item"]').count();
    expect(remainingTasks).toBe(initialTasks - 1);
    
    // Verify success toast
    const successToast = page.getByRole('status').getByText(/Task deleted/i);
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });
});