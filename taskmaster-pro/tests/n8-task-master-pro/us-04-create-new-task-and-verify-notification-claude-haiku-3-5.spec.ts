import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

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
    
    // Verify form submission is prevented (validation error)
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('should create a new task with valid input', async ({ page }) => {
    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Fill task title
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    
    // Select Priority (assuming a dropdown/select exists)
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('Medium');
    
    // Save the task
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify modal closes
    await expect(page.getByRole('button', { name: 'New Task' })).toBeVisible();
    
    // Verify task appears in list
    const taskList = page.locator('[data-testid="task-list"]');
    await expect(taskList.getByText('Test Task')).toBeVisible();
    
    // Verify success toast notification
    await expect(page.getByRole('alert', { name: 'Task created successfully' })).toBeVisible();
  });
});