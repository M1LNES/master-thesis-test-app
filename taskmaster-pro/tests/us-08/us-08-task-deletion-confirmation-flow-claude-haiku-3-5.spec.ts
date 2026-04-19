import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Deletion Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    
    // Login
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should display confirmation dialog when deleting a task', async ({ page }) => {
    // Find the first task's delete button
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first();
    
    // Click delete button
    await deleteButton.click();
    
    // Verify confirmation dialog appears
    const confirmDialog = page.getByRole('dialog', { name: /Delete task/ });
    await expect(confirmDialog).toBeVisible();
  });

  test('should remove task and show success toast after confirmation', async ({ page }) => {
    // Store initial task count
    const initialTasks = await page.getByRole('heading', { level: 3 }).count();
    
    // Find the first task's delete button
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first();
    const taskTitle = await page.getByRole('heading', { level: 3 }).first().textContent();
    
    // Click delete button
    await deleteButton.click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /Confirm|Delete/i }).click();
    
    // Verify task is removed
    await expect(page.getByRole('heading', { name: taskTitle })).toHaveCount(0);
    
    // Verify task count decreased
    const remainingTasks = await page.getByRole('heading', { level: 3 }).count();
    expect(remainingTasks).toBe(initialTasks - 1);
    
    // Verify success toast
    const successToast = page.getByRole('status').getByText(/Task deleted/i);
    await expect(successToast).toBeVisible();
  });
});