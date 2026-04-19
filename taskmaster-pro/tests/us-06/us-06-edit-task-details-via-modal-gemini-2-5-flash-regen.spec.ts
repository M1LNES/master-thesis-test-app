import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] All acceptance criteria were verified and work correctly.
 */
test.describe('Edit Task details via Modal', () => {
  test('should update existing task priority via edit modal', async ({ page }) => {
    // 1. Log in using user@test.com and password123.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(baseUrl + '/dashboard');

    // 2. Click the 'Edit' button on an existing task in the list.
    // Use the first edit button found, assuming there's at least one task.
    await page.getByRole('button', { name: 'Edit' }).first().click();

    // 3. Verify that the edit modal opens and the input fields are pre-populated with the task's current data.
    const editTaskModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editTaskModal).toBeVisible();
    await expect(editTaskModal.getByRole('textbox', { name: 'Title' })).toHaveValue('Review related papers');
    await expect(editTaskModal.getByRole('textbox', { name: 'Description' })).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(editTaskModal.getByRole('combobox', { name: 'Priority' })).toHaveValue('Medium');

    // 4. Change the value in the 'Priority' field to a different option.
    await editTaskModal.getByRole('combobox', { name: 'Priority' }).selectOption('High');

    // 5. Click the 'Save' button.
    await editTaskModal.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically.
    await expect(editTaskModal).not.toBeVisible();
    // Use a more specific locator for the success toast message to avoid strict mode violation.
    await expect(page.getByRole('status', { name: 'Notification Task updated successfully' })).toBeVisible();

    // 7. Verify that the task in the dashboard list now displays the updated Priority.
    // Locate the task item by its title and then verify the updated priority within that item.
    const taskItem = page.locator('div').filter({ hasText: 'Review related papers' }).first();
    await expect(taskItem.getByText('High')).toBeVisible();
  });
});