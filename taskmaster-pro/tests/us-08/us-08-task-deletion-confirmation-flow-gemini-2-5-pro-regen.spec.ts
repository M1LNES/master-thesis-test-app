import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Confirmation Prompt): The application correctly displays a confirmation dialog when the user clicks the delete button.
 * - [PASS] AC_02 (Successful Deletion): Upon confirming deletion, the task is correctly removed from the UI and a success notification is displayed.
 *
 * The original test failed due to a timeout while trying to find the task's delete button.
 * The locator `page.locator('div.border-border').filter(...)` was too fragile, relying on a generic styling class.
 * The fix involves using a more semantic and robust locator: `page.getByRole('region', { name: 'Task list' }).locator('> div').filter({ has: page.getByRole('heading', { name: taskTitle }) })`.
 * This locator first scopes the search to the "Task list" region, then selects only the direct child `div` elements (the task cards), and finally filters to the specific one containing the unique task title. This makes the test more resilient to style changes.
 */
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
    
    // Defer test execution until the dialog event is handled.
    const dialogPromise = page.waitForEvent('dialog');

    // Find the task container using a robust locator and click the 'Delete' button within it
    const taskContainer = page.getByRole('region', { name: 'Task list' })
      .locator('> div')
      .filter({ has: page.getByRole('heading', { name: taskTitle }) });
    await taskContainer.getByRole('button', { name: 'Delete' }).click();

    // Then: The system must display a confirmation dialog before proceeding.
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe(`Delete task "${taskTitle}"?`);
    
    // Clean up by dismissing the dialog to prevent it from hanging.
    await dialog.dismiss();
  });

  test('should delete the task and show a success notification upon confirmation', async ({ page }) => {
    // AC_02 (Successful Deletion)

    // Set up a listener to automatically accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Find the task container using a robust locator and click the 'Delete' button
    const taskContainer = page.getByRole('region', { name: 'Task list' })
      .locator('> div')
      .filter({ has: page.getByRole('heading', { name: taskTitle }) });
    await taskContainer.getByRole('button', { name: 'Delete' }).click();

    // Then: The task must be permanently removed from the dashboard list
    await expect(page.getByRole('heading', { name: taskTitle })).not.toBeVisible();

    // And: A success Toast notification must be displayed to confirm the action.
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});