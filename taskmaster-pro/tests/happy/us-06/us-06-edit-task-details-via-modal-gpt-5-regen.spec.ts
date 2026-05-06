/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with valid credentials navigates to dashboard and shows "Task list"
 * - [PASS] Clicking "Edit" opens "Edit Task" modal with fields pre-populated
 * - [PASS] Changing "Priority" to a different option and clicking "Save Task" closes the modal
 * - [PASS] The task card on the dashboard reflects the updated Priority
 *
 * Previous failure root cause:
 * - The test hard-coded the expected final priority ('High') and relied on a fragile parent locator. If the initial task priority wasn't 'Medium' or UI re-render timing varied, the assertion could miss the updated text.
 *
 * Fix:
 * - Read the current priority from the task card, select a different option dynamically, and re-query the card after save to assert the new priority is shown and the old one is gone.
 */

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

    // Scope to the specific task card by heading
    const titleText = 'Review related papers';
    const taskTitle = taskList.getByRole('heading', { level: 3, name: titleText });
    await expect(taskTitle).toBeVisible();

    // Parent container that holds the title and the priority text
    const taskHeaderContainer = taskTitle.locator('xpath=..');

    // Read current priority from the card (e.g., 'Low' | 'Medium' | 'High')
    const currentPriority = await taskHeaderContainer.getByText(/Low|Medium|High/).innerText();

    // 2. Click the 'Edit' button on an existing task in the list
    await taskList.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify that the edit modal opens and the input fields are pre-populated with the task's current data
    const editDialog = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editDialog).toBeVisible();

    await expect(editDialog.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(editDialog.getByLabel('Description')).toHaveValue(
      'Summarize 5 papers and compare methodology sections.'
    );
    await expect(editDialog.getByLabel('Priority').locator('option:checked')).toHaveText(currentPriority);

    // 4. Change the value in the 'Priority' field to a different option (dynamic to avoid hard-coding)
    const priorityOptions = ['Low', 'Medium', 'High'] as const;
    const newPriority = priorityOptions.find((p) => p !== (currentPriority as typeof priorityOptions[number])) ?? 'High';
    await editDialog.getByLabel('Priority').selectOption(newPriority);
    await expect(editDialog.getByLabel('Priority').locator('option:checked')).toHaveText(newPriority);

    // 5. Click the 'Save' button
    await editDialog.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically
    await expect(editDialog).toBeHidden();

    // Optional: Notification appears
    await expect(page.getByText('Task updated successfully')).toBeVisible();

    // 7. Verify that the task in the dashboard list now displays the updated Priority
    // Re-query the task card header container for stability after re-render
    const updatedTaskHeaderContainer = taskList
      .getByRole('heading', { level: 3, name: titleText })
      .locator('xpath=..');

    await expect(updatedTaskHeaderContainer.getByText(newPriority, { exact: true })).toBeVisible();
    await expect(updatedTaskHeaderContainer.getByText(currentPriority, { exact: true })).toHaveCount(0);
  });
});