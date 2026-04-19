import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-08] Task Deletion Confirmation Flow', () => {
  const taskTitle = `Task to be deleted - ${Date.now()}`;

  // Set up by logging in and creating a task before each test in this suite
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Create a new task
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByPlaceholder('Enter task title').fill(taskTitle);
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify the task was created before proceeding
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible();
  });

  test('should display a confirmation dialog when deleting a task', async ({ page }) => {
    // AC_01 (Confirmation Prompt)
    
    // Set up a listener for the dialog event *before* clicking the delete button
    let dialogMessage: string | null = null;
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss(); // Dismiss the dialog to avoid leaving it open
    });

    // Find the task container and click the 'Delete' button within it
    const taskContainer = page.locator('div.border-border').filter({ has: page.getByRole('heading', { name: taskTitle }) });
    await taskContainer.getByRole('button', { name: 'Delete' }).click();

    // Then: The system must display a confirmation dialog before proceeding.
    expect(dialogMessage).toContain(`Delete task "${taskTitle}"?`);
  });

  test('should delete the task and show a success notification upon confirmation', async ({ page }) => {
    // AC_02 (Successful Deletion)

    // Set up a listener to automatically accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Find the task container and click the 'Delete' button
    const taskContainer = page.locator('div.border-border').filter({ has: page.getByRole('heading', { name: taskTitle }) });
    await taskContainer.getByRole('button', { name: 'Delete' }).click();

    // Then: The task must be permanently removed from the dashboard list
    await expect(page.getByRole('heading', { name: taskTitle })).not.toBeVisible();

    // And: A success Toast notification must be displayed to confirm the action.
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});