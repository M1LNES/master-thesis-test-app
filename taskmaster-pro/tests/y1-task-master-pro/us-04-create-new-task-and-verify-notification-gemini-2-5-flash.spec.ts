import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=y1p6ls4v';

test.describe('Task Creation and Notification', () => {
  test('should create a new task and display a success notification', async ({ page }) => {
    // 1. Start at the base URL and log in using `user@test.com` and `password123`.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented due to a required field validation.
    // The modal should still be visible, indicating validation prevented submission.
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    // A more specific validation message would be ideal, but based on snapshot the modal just stays open.
    // Assuming the lack of modal closure implies validation failure.

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    // The "Priority" combobox defaults to "Medium" which is acceptable as per the user story.
    // If we wanted to explicitly select, it would be: await page.getByRole('combobox', { name: 'Priority' }).selectOption('Medium');

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    await expect(page.getByRole('heading', { name: 'Test Task', level: 3 })).toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen.
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});