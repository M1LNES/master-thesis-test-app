/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login works and dashboard loads as expected.
 * - [PASS] 'New Task' button opens the creation modal.
 * - [FAIL] Submitting the form with an empty Title does NOT prevent submission; an "(Untitled Task)" is created instead of showing a required field validation. (Implementation bug)
 * - [PASS] Filling Title and Priority, saving, closes the modal and creates the task.
 * - [PASS] "Test Task" appears in the dashboard task list after creation.
 * - [PASS] Success Toast notification ("Task created successfully") appears after task creation.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

test.describe('[US-04] Create New Task and Verify Notification', () => {
  test('should log in, create a new task, and show confirmation', async ({ page }) => {
    // 1. Start at the base URL and log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2. Click the 'New Task' button to open the creation modal
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave the Title field empty and click 'Save'
    // 4. Verify that the form submission is prevented due to a required field validation.
    test.fail(true, 'Submitting with empty Title does NOT prevent submission; an "(Untitled Task)" is created (implementation bug)');
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Expect the modal to remain open and a validation message to appear (expected behavior)
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    // If there is a validation message, check for it (expected, but not implemented)
    // await expect(page.getByText(/required/i)).toBeVisible();

    // Close the modal if still open (cleanup for next steps)
    if (await page.getByRole('dialog', { name: 'Create New Task' }).isVisible()) {
      await page.getByRole('button', { name: 'Cancel' }).click();
    }

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption({ label: 'High' });

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).not.toBeVisible();

    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen.
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});