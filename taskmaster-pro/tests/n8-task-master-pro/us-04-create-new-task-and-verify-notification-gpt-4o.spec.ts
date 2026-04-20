import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

test.describe('Create New Task and Verify Notification', () => {
  test('should prevent form submission when Title is empty', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify that the form submission is prevented
    const modalVisible = await page.getByRole('dialog', { name: 'Create New Task' }).isVisible();
    expect(modalVisible).toBe(true);
  });

  test('should create a new task and show success notification', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption(['High']);
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify that the modal automatically closes
    const modalVisible = await page.getByRole('dialog', { name: 'Create New Task' }).isVisible();
    expect(modalVisible).toBe(false);

    // Verify that the newly created "Test Task" is visible in the dashboard task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // Verify that a success Toast notification appears on the screen
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});