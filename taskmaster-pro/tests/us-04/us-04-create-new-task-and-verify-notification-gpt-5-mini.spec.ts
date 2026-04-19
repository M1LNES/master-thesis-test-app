/**
 * IMPLEMENTATION NOTES:
 * - [PASS] 1. Start at the base URL and log in using `user@test.com` / `password123`.
 *   - Observation: base URL redirects to /login. Login form present and logging in navigates to /dashboard.
 * - [PASS] 2. Click the 'New Task' button to open the creation modal.
 *   - Observation: 'New Task' button opens a dialog titled "Create New Task".
 * - [PASS] 3. Leave the Title field completely empty and click 'Save'.
 *   - Observation: Clicking "Save Task" with empty Title leaves the dialog open.
 * - [PASS] 4. Verify that the form submission is prevented due to a required field validation.
 *   - Observation: Title textbox has the `required` attribute and the dialog remains visible after save attempt.
 * - [PASS] 5. Fill the Title field with "Test Task" and select a Priority.
 *   - Observation: Title textbox and Priority combobox are present and selectable.
 * - [PASS] 6. Click 'Save' and verify that the modal automatically closes.
 *   - Observation: After valid save, dialog closes.
 * - [PASS] 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
 *   - Observation: A task with heading "Test Task" appears in the task list.
 * - [PASS] 8. Verify that a success Toast notification appears on the screen.
 *   - Observation: Notification "Task created successfully" appears in the Notifications region.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('US-04 Create New Task and Verify Notification', () => {
  test('should prevent submission when Title is empty then create task and show success toast', async ({ page }) => {
    // 1. Start at the base URL and log in
    await page.goto(baseUrl);
    // Wait for login screen
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Ensure navigation to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Click the 'New Task' button to open creation modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const createDialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(createDialog).toBeVisible();

    // 3. Leave the Title field empty and click 'Save'
    const titleInput = page.getByRole('textbox', { name: 'Title' });
    // Ensure it's empty
    await expect(titleInput).toHaveValue('');
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify submission is prevented due to required validation
    // The dialog should remain visible (submission prevented)
    await expect(createDialog).toBeVisible();
    // And the Title field should have the required attribute
    await expect(titleInput).toHaveAttribute('required', '');

    // 5. Fill the Title field with "Test Task" and select a Priority
    await titleInput.fill('Test Task');
    // Use label-based selector for the combobox (Priority)
    const priority = page.getByLabel('Priority');
    await expect(priority).toBeVisible();
    await priority.selectOption({ label: 'High' });

    // 6. Click 'Save' and verify that the modal automatically closes
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(createDialog).toBeHidden();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list
    // The task appears as a heading in the task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();
    // Also assert the priority text is shown near the task (strict text selector)
    await expect(page.getByText('High')).toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});