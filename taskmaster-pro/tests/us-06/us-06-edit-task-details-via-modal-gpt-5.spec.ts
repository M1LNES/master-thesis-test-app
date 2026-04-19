import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should update task Priority via modal and reflect on dashboard when saved', async ({ page }) => {
    // 1. Log in using valid credentials
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // 2. Click the 'Edit' button on an existing task in the list
    await page.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify that the edit modal opens and inputs are pre-populated with current data
    const editDialog = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editDialog).toBeVisible();

    await expect(editDialog.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(editDialog.getByLabel('Description')).toHaveValue(
      'Summarize 5 papers and compare methodology sections.'
    );
    await expect(editDialog.getByLabel('Priority').locator('option:checked')).toHaveText('Medium');

    // 4. Change the value in the 'Priority' field to a different option
    await editDialog.getByLabel('Priority').selectOption('High');
    await expect(editDialog.getByLabel('Priority').locator('option:checked')).toHaveText('High');

    // 5. Click the 'Save' button
    await editDialog.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically
    await expect(editDialog).toBeHidden();

    // 7. Verify that the task in the dashboard list now displays the updated Priority
    // Scope to the task title and assert the Priority text changed to "High"
    const taskTitle = taskList.getByRole('heading', { name: 'Review related papers' });
    await expect(taskTitle).toBeVisible();
    const taskContainer = taskTitle.locator('xpath=..');

    await expect(taskContainer.getByText('High', { exact: true })).toBeVisible();
    await expect(taskContainer.getByText('Medium', { exact: true })).toHaveCount(0);
  });
});