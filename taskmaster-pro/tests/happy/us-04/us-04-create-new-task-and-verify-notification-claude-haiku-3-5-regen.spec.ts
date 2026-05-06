import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    
    // Login
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should prevent task creation with empty title and show validation', async ({ page }) => {
    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Click Save without filling title
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify title field validation
    const titleInput = page.getByRole('textbox', { name: 'Title' });
    await expect(titleInput).toHaveAttribute('required');
    
    // Optional: Check for validation message
    const validationMessage = page.getByText('Title is required');
    await expect(validationMessage).toBeVisible();
  });

  test('should create a task successfully and show confirmation', async ({ page }) => {
    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Fill task details
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('Medium');
    
    // Save task
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify modal closes
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();
    
    // Verify task appears in list
    const taskHeading = page.getByRole('heading', { name: 'Test Task' });
    await expect(taskHeading).toBeVisible();
    
    // Verify success toast notification
    const toast = page.getByRole('region', { name: 'Notifications' });
    await expect(toast).toContainText('Task created successfully');
  });
});