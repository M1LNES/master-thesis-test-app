import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=y1p6ls4v';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in with valid credentials and navigate to the dashboard.
 * - [PASS] Open the 'New Task' modal and verify required field validation.
 * - [PASS] Create a new task with a title and priority, verify it appears in the task list.
 * - [PASS] Verify that a success Toast notification appears on the screen.
 */

test.describe('Task Creation and Notification', () => {
  test('should prevent form submission when Title is empty', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify that the modal is still open due to validation error
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
  });

  test('should create a new task and display success notification', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption(['High']);
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify that the modal closes
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();
    
    // Verify the task appears in the task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();
    
    // Verify the success notification appears
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});