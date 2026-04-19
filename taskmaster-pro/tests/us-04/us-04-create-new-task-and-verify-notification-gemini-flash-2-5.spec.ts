import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Creation and Notification', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Start at the base URL and log in
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should prevent task creation with empty title and show success notification on valid creation', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented due to a required field validation.
    // The modal remains open, indicating validation prevention.
    // A more explicit error message assertion would be ideal if one was visible in the DOM.
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    // Additionally, verify that the title input itself shows a validation error.
    await expect(page.getByLabel('Title')).toBeInvalid();


    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByLabel('Title').fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    await expect(page.getByRole('heading', { name: 'Test Task', level: 3 })).toBeVisible();
    await expect(page.getByText('High')).toBeVisible(); // Verifying priority alongside the task

    // 8. Verify that a success Toast notification appears on the screen.
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});