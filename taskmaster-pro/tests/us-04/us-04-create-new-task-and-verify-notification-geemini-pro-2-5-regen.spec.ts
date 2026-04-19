import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-04] Create New Task and Verify Notification', () => {
  // 1. Start at the base URL and log in
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    // The application automatically redirects to /login if not authenticated
    // but we handle both cases by checking the URL.
    if (!page.url().includes('/dashboard')) {
      await page.getByLabel('Email').fill('user@test.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
    }
    await page.waitForURL('**/dashboard');
  });

  test('should prevent submission when title is empty', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await modal.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented
    // The modal should remain visible as validation prevents it from closing.
    await expect(modal).toBeVisible();
  });

  test('should create a new task and show a success notification', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await modal.getByLabel('Title').fill('Test Task');
    await modal.getByLabel('Priority').selectOption({ label: 'High' });

    // 6. Click 'Save' and verify that the modal automatically closes.
    await modal.getByRole('button', { name: 'Save Task' }).click();
    await expect(modal).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Test Task' })).toBeVisible();
    await expect(taskList.getByText('High')).toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen.
    // FIX: Scoped the text locator within the "Notifications" region to resolve strict mode violation.
    const notifications = page.getByRole('region', { name: 'Notifications (F8)' });
    await expect(notifications.getByText('Task created successfully')).toBeVisible();
  });
});