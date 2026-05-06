import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login functionality works correctly and redirects to the dashboard.
 * - [PASS] 'New Task' button opens the task creation modal.
 * - [PASS] Form submission is prevented when the Title field is empty.
 * - [PASS] Task creation with a title and priority closes the modal and adds the task to the list.
 * - [PASS] Success toast notification appears after task creation.
 */

test.describe('Task Creation and Notification', () => {
  test('should prevent form submission when Title is empty', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(baseUrl + '/dashboard');

    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify that the modal is still open, indicating form submission was prevented
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
  });

  test('should create a new task and show a success notification', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(baseUrl + '/dashboard');

    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption(['High']);
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify that the modal closes
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // Verify that the new task is visible in the task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // Verify that a success toast notification appears
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});