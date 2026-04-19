import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Deletion Confirmation Flow [US-08]', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should display confirmation dialog when clicking Delete button on a task (AC_01)', async ({ page }) => {
    // Create a test task first
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Task to Delete');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for task to appear
    await expect(page.getByRole('heading', { name: 'Task to Delete' })).toBeVisible();
    
    // Set up dialog handler to verify it appears
    let dialogMessage = '';
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });
    
    // Click the Delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify the confirmation dialog message
    await page.waitForTimeout(100); // Brief wait to ensure dialog was handled
    expect(dialogMessage).toContain('Delete task "Task to Delete"?');
    
    // Verify task still exists after canceling
    await expect(page.getByRole('heading', { name: 'Task to Delete' })).toBeVisible();
  });

  test('should permanently remove task and show success notification when deletion is confirmed (AC_02)', async ({ page }) => {
    // Create a test task first
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Task to Delete Permanently');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for task to appear
    await expect(page.getByRole('heading', { name: 'Task to Delete Permanently' })).toBeVisible();
    
    // Set up dialog handler to accept deletion
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete task "Task to Delete Permanently"?');
      await dialog.accept();
    });
    
    // Click the Delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify task is removed from the dashboard
    await expect(page.getByRole('heading', { name: 'Task to Delete Permanently' })).not.toBeVisible();
    
    // Verify success toast notification is displayed
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });

  test('should keep task intact when deletion is canceled', async ({ page }) => {
    // Create a test task first
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Task to Keep');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for task to appear
    await expect(page.getByRole('heading', { name: 'Task to Keep' })).toBeVisible();
    
    // Set up dialog handler to cancel deletion
    page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
    
    // Click the Delete button
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify task still exists
    await expect(page.getByRole('heading', { name: 'Task to Keep' })).toBeVisible();
    
    // Verify no success notification appears
    await expect(page.getByText('Task deleted successfully')).not.toBeVisible();
  });

  test('should handle deletion of existing task from previous session', async ({ page }) => {
    // Check if there are any existing tasks
    const taskList = page.getByRole('region', { name: 'Task list' });
    const noTasksMessage = taskList.getByText('No tasks found for this filter.');
    
    // If no tasks exist, create one
    if (await noTasksMessage.isVisible()) {
      await page.getByRole('button', { name: 'New Task' }).click();
      await page.getByRole('textbox', { name: 'Title' }).fill('Existing Task');
      await page.getByRole('button', { name: 'Save Task' }).click();
      await expect(page.getByRole('heading', { name: 'Existing Task' })).toBeVisible();
    }
    
    // Get the first delete button
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first();
    
    // Set up dialog handler to accept deletion
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toMatch(/Delete task ".+"?/);
      await dialog.accept();
    });
    
    // Click the Delete button
    await deleteButton.click();
    
    // Verify success toast notification is displayed
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});