import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Start at the base URL and log in.
 * - [PASS] Criterion 2: Click the 'New Task' button to open the creation modal.
 * - [PASS] Criterion 3 & 4: Leaving the Title field empty and clicking 'Save' prevents submission; the modal remains open. No explicit error message element for the title field was observed, so verifying modal visibility is the primary assertion.
 * - [PASS] Criterion 5 & 6: Filling Title and Priority, then saving, closes the modal.
 * - [PASS] Criterion 7: The newly created "Test Task" is visible in the dashboard. Resolved strict mode violation by using `.first()` for the task title and scoping the priority assertion to the specific task item.
 * - [PASS] Criterion 8: A success Toast notification appears.
 */
test.describe('Task Creation and Notification', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Start at the base URL and log in
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should prevent task creation with empty title and show success notification on valid creation', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented due to a required field validation.
    // The modal remains open, indicating validation prevention.
    // A more explicit error message assertion would be ideal if one was visible in the DOM, but none was observed.
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByLabel('Title').fill('Test Task');
    // The snapshot shows 'Medium' is selected by default, changing to 'High'.
    await page.getByLabel('Priority').selectOption('High');

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    // Use .first() to target the newly created task, assuming it appears at the top.
    const newTaskTitle = page.getByRole('heading', { name: 'Test Task', level: 3 }).first();
    await expect(newTaskTitle).toBeVisible();
    // Also verify the priority is visible alongside the task, scoping to the specific task item.
    const newTaskItemContainer = newTaskTitle.locator('..').locator('..');
    await expect(newTaskItemContainer).toContainText('High');

    // 8. Verify that a success Toast notification appears on the screen.
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});