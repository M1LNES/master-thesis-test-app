import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should allow a user to edit a task priority and see the update on the dashboard', async ({ page }) => {
    // 1. Log in using user@test.com and password123.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // Find the specific task card we want to interact with.
    const taskCardLocator = page
      .getByRole('region', { name: 'Task list' })
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'Review related papers' }) });

    // 2. Click the 'Edit' button on an existing task in the list.
    await taskCardLocator.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify that the edit modal opens and the input fields are pre-populated.
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    await expect(editModal.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(editModal.getByLabel('Description')).toHaveValue(
      'Summarize 5 papers and compare methodology sections.'
    );
    await expect(editModal.getByLabel('Priority')).toHaveValue('Medium');

    // 4. Change the value in the 'Priority' field to a different option.
    await editModal.getByLabel('Priority').selectOption('High');

    // 5. Click the 'Save' button.
    await editModal.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically.
    await expect(editModal).toBeHidden();

    // 7. Verify that the task in the dashboard list now displays the updated Priority.
    // We assert that the new priority text is visible within the specific task card,
    // and that the old text is no longer present.
    await expect(taskCardLocator.getByText('High')).toBeVisible();
    await expect(taskCardLocator.getByText('Medium')).not.toBeVisible();
  });
});