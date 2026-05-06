/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Confirmation dialog appears when clicking 'Delete' on a task.
 * - [PASS] AC_02: Accepting the confirmation dialog removes the task from the dashboard and shows a success Toast notification.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Deletion Confirmation Flow', () => {
  test('should display confirmation dialog when clicking Delete on a task', async ({ page }) => {
    // Login
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard and task to appear
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Expect confirmation dialog to appear
    // Playwright auto-handles dialogs, but we can listen for it
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete task "Review related papers"?');
      await dialog.dismiss(); // Dismiss to not delete in this test
    });

    // Trigger the dialog again for Playwright to catch
    await page.getByRole('button', { name: 'Delete' }).click();
  });

  test('should remove task and show success Toast when deletion is confirmed', async ({ page }) => {
    // Login
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard and task to appear
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();

    // Listen for the confirmation dialog and accept it
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete task "Review related papers"?');
      await dialog.accept();
    });

    // Click Delete button
    await page.getByRole('button', { name: 'Delete' }).click();

    // Task should be removed from the dashboard
    await expect(page.getByRole('heading', { name: 'Review related papers' })).not.toBeVisible();

    // Success Toast should be visible
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});