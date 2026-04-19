import { test, expect } from '@playwright/test';

const baseUrl: string = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Login works at /login with labels 'Email' and 'Password' and button 'Login'.
 * - [PASS] Criterion 2: The dashboard shows an 'Edit' button for an existing task.
 * - [PASS] Criterion 3: Clicking 'Edit' opens a modal with heading 'Edit Task' and inputs:
 *           - Title (id/task-title) pre-filled with "Review related papers"
 *           - Description (id/task-description) pre-filled with "Summarize 5 papers and compare methodology sections."
 *           - Priority (id/task-priority) with options Low/Medium/High and current value "Medium"
 * - [PASS] Criterion 4: Priority select is changeable programmatically via selectOption.
 * - [PASS] Criterion 5: Save button in modal is labeled 'Save Task'.
 * - [PASS] Criterion 6: Modal closes after saving.
 * - [PASS] Criterion 7: The task in the dashboard updates to show the selected Priority value (e.g. 'High').
 */

test.describe('US-06 Edit Task details via Modal', () => {
  test('should update task priority via modal from the dashboard', async ({ page }) => {
    // Step 1: Navigate to app and log in
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Locate the target task by its title to make assertions scoped to the correct card
    const taskTitle = 'Review related papers';
    const taskHeading = page.getByRole('heading', { name: taskTitle });
    await expect(taskHeading).toBeVisible();

    // Step 2: Click the 'Edit' button on the existing task in the list
    // Use the first Edit button in the card that contains the task title
    const taskCard = taskHeading.locator('..'); // parent container where the priority badge lives
    // Find the Edit button within the same card (fallback: global first if not found)
    const editButtonInCard = taskCard.getByRole('button', { name: 'Edit' });
    if (await editButtonInCard.count() > 0) {
      await editButtonInCard.first().click();
    } else {
      // Fallback to global first Edit button (observed to exist)
      await page.getByRole('button', { name: 'Edit' }).first().click();
    }

    // Step 3: Verify edit modal opens and fields are pre-populated
    const modalHeading = page.getByRole('heading', { name: 'Edit Task' });
    await expect(modalHeading).toBeVisible();

    // Input fields by their labels
    const titleInput = page.getByLabel('Title');
    const descriptionInput = page.getByLabel('Description');
    const prioritySelect = page.getByLabel('Priority');

    // Assert pre-populated values match the task's current data
    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(prioritySelect).toHaveValue('Medium'); // current priority

    // Step 4: Change Priority to a different option (choose 'High')
    const newPriority = 'High';
    // Ensure we pick a different option than current
    const currentPriority = await prioritySelect.inputValue();
    if (currentPriority === newPriority) {
      // If for some reason the current value is already 'High', pick 'Low' instead
      await prioritySelect.selectOption('Low');
    } else {
      await prioritySelect.selectOption(newPriority);
    }

    // Verify the select reflects the newly chosen value before saving
    await expect(prioritySelect).toHaveValue(newPriority === currentPriority ? 'Low' : newPriority);

    // Step 5: Click the 'Save' button (observed label 'Save Task')
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Step 6: Verify the edit modal closes automatically
    // The modal heading should be gone (either hidden or removed). Use count=0 to cover both.
    await expect(modalHeading).toHaveCount(0);

    // Optional small wait for the dashboard to reflect changes (network idle or UI update)
    await page.waitForLoadState('networkidle');

    // Step 7: Verify the task in the dashboard list now displays the updated Priority
    // Re-scope to the task card and look for the badge text that shows priority
    const updatedTaskHeading = page.getByRole('heading', { name: taskTitle });
    await expect(updatedTaskHeading).toBeVisible();
    const updatedCard = updatedTaskHeading.locator('..');
    // The priority badge is an inline text element in that container; assert it shows the new priority
    await expect(updatedCard.getByText(newPriority === currentPriority ? 'Low' : newPriority)).toBeVisible();
  });
});