import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Task Deletion Confirmation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user@test.com
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Create a new task for deletion test
    await page.getByRole('button', { name: 'New Task' }).click();
    // Updated selectors based on the snapshot
    await page.getByPlaceholder('Enter task title').fill('Task to be deleted');
    await page.getByPlaceholder('Add optional details').fill('This task will be deleted during the test.');
    await page.getByRole('button', { name: 'Save Task' }).click(); // Updated button name
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });

  test('should display a confirmation dialog before deleting a task (AC_01)', async ({ page }) => {
    // Given I am logged in as user@test.com and have an existing task (handled in beforeEach)
    // When I click the 'Delete' button on my task
    page.on('dialog', async dialog => {
      expect(dialog.type()).toContain('confirm');
      expect(dialog.message()).toContain('Delete task "Task to be deleted"?');
      await dialog.dismiss(); // Dismiss the dialog to prevent actual deletion during this test
    });
    await page.getByRole('button', { name: 'Delete' }).first().click();
  });

  test('should permanently remove the task and display a success Toast notification upon confirmation (AC_02)', async ({ page }) => {
    // Given the deletion confirmation dialog is visible
    // When I accept/confirm the deletion
    page.on('dialog', async dialog => {
      expect(dialog.type()).toContain('confirm');
      expect(dialog.message()).toContain('Delete task "Task to be deleted"?');
      await dialog.accept(); // Accept the dialog to proceed with deletion
    });
    await page.getByRole('button', { name: 'Delete' }).first().click();

    // Then the task must be permanently removed from the dashboard list
    await expect(page.getByText('Task to be deleted')).not.toBeVisible();
    await expect(page.getByText('No tasks found for this filter.')).toBeVisible(); // Assuming this text appears when no tasks are present

    // And a success Toast notification must be displayed to confirm the action
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});