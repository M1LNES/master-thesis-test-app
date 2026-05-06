import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=y1p6ls4v';

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

  test('should prevent task creation with empty title', async ({ page }) => {
    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Try to save without filling title
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify validation prevents submission
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('should create a new task with valid input', async ({ page }) => {
    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Fill task title
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    
    // Select Priority (assuming a dropdown or radio buttons)
    await page.getByRole('radio', { name: 'Medium' }).click();
    
    // Save the task
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify modal closes
    await expect(page.getByRole('button', { name: 'New Task' })).toBeVisible();
    
    // Verify task appears in list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();
    
    // Verify success toast notification
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});