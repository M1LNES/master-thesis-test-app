import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=y1p6ls4v';

test.describe('Create New Task and Verify Notification', () => {
  test('should create a new task and see a success notification', async ({ page }) => {
    // 1. Start at the base URL and log in using `user@test.com` and `password123`
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. Click the 'New Task' button to open the creation modal
    await page.getByRole('button', { name: 'New Task' }).click();

    // 3. Leave the Title field completely empty and click 'Save'
    await page.getByRole('button', { name: 'Save' }).click();

    // 4. Verify that the form submission is prevented due to a required field validation
    await expect(page.getByText('Title is required')).toBeVisible();

    // 5. Fill the Title field with "Test Task" and select a Priority
    await page.getByLabel('Title').fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    // 6. Click 'Save' and verify that the modal automatically closes
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list
    await expect(page.getByText('Test Task')).toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});