/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Confirmation Prompt) — Clicking the task's "Delete" button triggers a native confirm dialog with an appropriate message.
 * - [PASS] AC_02 (Successful Deletion) — Accepting the confirmation removes the task from the dashboard and displays a success toast "Task deleted successfully".
 */

import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const userEmail = 'user@test.com';
const userPassword = 'password123';

async function signIn(page: Page) {
  await page.goto(baseUrl);
  // Wait for login form
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(userEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(userPassword);
  await Promise.all([
    page.waitForURL('**/dashboard'),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);
  // Ensure dashboard loaded
  await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
}

test.describe('US-08 Task Deletion Confirmation Flow', () => {
  test('should display a confirmation dialog when clicking Delete on a task (AC_01)', async ({ page }) => {
    await signIn(page);

    // Locate the specific task row by its heading and the Delete button within it
    const taskHeading = page.getByRole('heading', { name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();

    const taskRow = taskHeading.locator('..');
    const deleteButton = taskRow.getByRole('button', { name: 'Delete' });

    // Click Delete and wait for the confirm dialog to appear
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      deleteButton.click(),
    ]);

    // Assert that a confirm dialog appeared with an expected message
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Delete task');

    // Dismiss the dialog to emulate user cancelling the deletion (edge case)
    await dialog.dismiss();

    // After cancelling, the task should still be present and no success toast should appear
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
    await expect(page.getByText('Task deleted successfully')).toHaveCount(0);
  });

  test('should remove the task and show a success toast when deletion is confirmed (AC_02)', async ({ page }) => {
    await signIn(page);

    // Ensure the task exists before attempting deletion
    const taskHeading = page.getByRole('heading', { name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();

    const taskRow = taskHeading.locator('..');
    const deleteButton = taskRow.getByRole('button', { name: 'Delete' });

    // Click Delete and accept the confirm dialog
    const [dialog] = await Promise.all([
      page.waitForEvent('dialog'),
      deleteButton.click(),
    ]);

    // Verify dialog content and accept
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Delete task');
    await dialog.accept();

    // Verify the success toast appears (use standard auto-waiting)
    await expect(page.getByText('Task deleted successfully')).toBeVisible();

    // Verify the task is no longer present in the dashboard list
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toHaveCount(0);

    // Optionally, verify "No tasks found for this filter." is shown (observed state)
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible();
  });
});