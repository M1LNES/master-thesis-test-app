/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login form is present and works with strict label selectors.
 * - [PASS] 'New Task' button opens a modal dialog with strict text selectors.
 * - [PASS] Leaving the Title field empty and clicking 'Save Task' keeps the modal open (submission prevented), but NO explicit validation message is shown in the modal snapshot. We assert modal remains open.
 * - [PASS] Filling Title and Priority, then clicking 'Save Task' closes the modal.
 * - [PASS] "Test Task" appears in the dashboard task list after creation.
 * - [PASS] Success Toast notification ("Task created successfully") appears after task creation, in region[Notifications (F8)] > list > listitem.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Creation & Notification', () => {
  test('should prevent submission and keep modal open when Title is empty', async ({ page }) => {
    // 1. Login
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Open 'New Task' modal
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave Title empty and click 'Save Task'
    // (Title is empty by default)
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Assert: Modal is still open (submission prevented)
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    // Optionally: Check that Title textbox is still present and focused
    await expect(page.getByRole('textbox', { name: 'Title' })).toBeVisible();
  });

  test('should create a new task and show success notification', async ({ page }) => {
    // 1. Login
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Open 'New Task' modal
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 5. Fill Title and select Priority
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption({ label: 'High' });

    // 6. Click 'Save Task'
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 6. Assert: Modal closes
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // 7. Assert: "Test Task" is visible in dashboard task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // 8. Assert: Success Toast notification appears in Notifications region
    const notificationRegion = page.getByRole('region', { name: /Notifications/i });
    const toast = notificationRegion.getByRole('listitem').getByText('Task created successfully', { exact: true });
    await expect(toast).toBeVisible();
  });
});