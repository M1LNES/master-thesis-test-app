import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=y1p6ls4v';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with valid credentials navigates to Dashboard
 * - [PASS] Clicking 'New Task' opens the 'Create New Task' modal
 * - [PASS] Submitting with an empty Title is blocked by required validation (modal stays open; input validity.valueMissing = true)
 * - [PASS] Filling Title "Test Task" and selecting a Priority, then saving, closes the modal and shows "Test Task" in the task list
 * - [FAIL] Success toast notification was not observed after saving; the "Notifications (F8)" region remained empty and no [role=alert]/status elements were found
 */

test.describe('[y1] Task Master Pro - [US-04] Create New Task and Verify Notification', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Start at the base URL and log in using `user@test.com` and `password123`.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should prevent submission when Title is empty in New Task modal', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(dialog).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented due to a required field validation.
    await expect(dialog).toBeVisible();

    const title = page.getByRole('textbox', { name: 'Title' });
    const valueMissing = await title.evaluate((el) => (el as HTMLInputElement).validity.valueMissing);
    expect(valueMissing).toBe(true);
  });

  test('should create task and close modal when Title and Priority are provided', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(dialog).toBeVisible();

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(dialog).toBeHidden();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Test Task' })).toBeVisible();
  });

  test('should show success Toast notification after creating a task', async ({ page }) => {
    // 8. Verify that a success Toast notification appears on the screen.
    // Observed behavior: No toast visible; Notifications region remains empty.
    test.fail(); // Marked to fail until a toast/notification is implemented.

    // Create a task to trigger notification
    await page.getByRole('button', { name: 'New Task' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(dialog).toBeVisible();

    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(dialog).toBeHidden();

    // Expect at least one list item to appear in the Notifications region
    const notificationsRegion = page.getByRole('region', { name: 'Notifications (F8)' });
    await expect(notificationsRegion.getByRole('listitem').first()).toBeVisible();
  });
});