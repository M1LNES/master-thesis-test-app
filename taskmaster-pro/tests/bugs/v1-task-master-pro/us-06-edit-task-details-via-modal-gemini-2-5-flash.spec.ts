import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should update task priority via edit modal', async ({ page }) => {
    // 1. Log in using user@test.com and password123.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // 2. Click the 'Edit' button on an existing task in the list.
    const taskTitle = 'Review related papers';
    const taskLocator = page.locator(`.task-item:has-text("${taskTitle}")`); // Assuming a class 'task-item' for task entries
    await taskLocator.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify that the edit modal opens and the input fields are pre-populated with the task's current data.
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    await expect(editModal.getByLabel('Title')).toHaveValue(taskTitle);
    await expect(editModal.getByLabel('Description')).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(editModal.getByLabel('Priority')).toHaveValue('Medium'); // Initial priority observed

    // 4. Change the value in the 'Priority' field to a different option.
    const newPriority = 'High';
    await editModal.getByLabel('Priority').selectOption(newPriority);

    // 5. Click the 'Save' button.
    await editModal.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically.
    await expect(editModal).not.toBeVisible();

    // 7. Verify that the task in the dashboard list now displays the updated Priority.
    await expect(taskLocator.locator('p', { hasText: newPriority })).toBeVisible();
  });
});