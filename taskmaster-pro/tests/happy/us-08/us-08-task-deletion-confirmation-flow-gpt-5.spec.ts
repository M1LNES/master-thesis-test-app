/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Confirmation Prompt): Clicking 'Delete' on a task triggers a native confirm dialog with message `Delete task "<title>"?`.
 * - [PASS] AC_02 (Successful Deletion): Accepting the confirm deletes the task from the dashboard list and shows a success notification "Task deleted successfully" in the Notifications region.
 */

import { test, expect, type Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function login(page: Page): Promise<void> {
  await page.goto(baseUrl);
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
}

async function createTask(page: Page, title: string, description: string, priority: 'Low' | 'Medium' | 'High' = 'High'): Promise<void> {
  await page.getByRole('button', { name: 'New Task' }).click();
  await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Description' }).fill(description);
  await page.getByLabel('Priority').selectOption(priority);

  await page.getByRole('button', { name: 'Save Task' }).click();

  // Verify task appears in the list
  await expect(page.getByRole('heading', { level: 3, name: title })).toBeVisible();
}

function deleteButtonForTask(page: Page, title: string) {
  const heading = page.getByRole('heading', { level: 3, name: title });
  // Traverse up to the task card container and find the 'Delete' button within it
  return heading.locator('..').locator('..').getByRole('button', { name: 'Delete' });
}

test.describe('[US-08] Task Deletion Confirmation Flow', () => {
  test('should display confirmation dialog when clicking Delete on a task', async ({ page }) => {
    await login(page);

    const taskTitle = `E2E Delete Prompt ${Date.now()}`;
    await createTask(page, taskTitle, 'Task created to verify deletion confirmation.');

    const dialogPromise = page.waitForEvent('dialog');
    await deleteButtonForTask(page, taskTitle).click();

    const dialog = await dialogPromise;
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Delete task');
    expect(dialog.message()).toContain(taskTitle);

    // Accept to clean up
    await dialog.accept();

    // Ensure task is removed
    await expect(page.getByRole('heading', { level: 3, name: taskTitle })).toHaveCount(0);
  });

  test('should remove the task and show success toast when deletion is confirmed', async ({ page }) => {
    await login(page);

    const taskTitle = `E2E Delete Success ${Date.now()}`;
    await createTask(page, taskTitle, 'Task created to verify successful deletion and toast.');

    // Trigger deletion and accept confirmation
    const dialogPromise = page.waitForEvent('dialog');
    await deleteButtonForTask(page, taskTitle).click();
    const dialog = await dialogPromise;
    await dialog.accept();

    // Assert task is no longer present in the dashboard list
    await expect(page.getByRole('heading', { level: 3, name: taskTitle })).toHaveCount(0);

    // Assert success toast/notification is displayed (auto-wait via expect)
    const notificationsRegion = page.getByRole('region', { name: 'Notifications (F8)' });
    await expect(notificationsRegion.getByText('Task deleted successfully')).toBeVisible();
  });
});