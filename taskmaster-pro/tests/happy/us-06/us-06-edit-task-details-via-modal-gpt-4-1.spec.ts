/**
 * IMPLEMENTATION NOTES:
 * - [PASS] All acceptance criteria verified and work correctly:
 *   - Login works and redirects to dashboard.
 *   - Edit button opens modal with pre-populated fields.
 *   - Priority field can be changed and saved.
 *   - Modal closes after save.
 *   - Task list updates with new Priority.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should update task priority via modal and reflect changes in dashboard', async ({ page }) => {
    // 1. Log in
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // 2. Click the 'Edit' button on an existing task
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
    await page.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify edit modal opens and fields are pre-populated
    const modal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('textbox', { name: 'Title' })).toHaveValue('Review related papers');
    await expect(modal.getByRole('textbox', { name: 'Description' })).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(modal.getByLabel('Priority')).toHaveValue('Medium');

    // 4. Change the value in the 'Priority' field to a different option
    await modal.getByLabel('Priority').selectOption('High');
    await expect(modal.getByLabel('Priority')).toHaveValue('High');

    // 5. Click the 'Save' button
    await modal.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically
    await expect(modal).toBeHidden();

    // 7. Verify that the task in the dashboard list now displays the updated Priority
    // The task "Review related papers" should now show "High" as its priority
    const taskCard = page.getByRole('heading', { name: 'Review related papers' }).locator('..').locator('..');
    await expect(taskCard.getByText('High')).toBeVisible();

    // Optionally, verify success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
  });
});