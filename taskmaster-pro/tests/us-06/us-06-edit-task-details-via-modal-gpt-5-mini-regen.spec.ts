import { test, expect } from '@playwright/test';

const baseUrl: string = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Login works at /login with labels 'Email' and 'Password' and button 'Login'.
 * - [PASS] Criterion 2: The dashboard shows an 'Edit' button for an existing task.
 * - [PASS] Criterion 3: Clicking 'Edit' opens a modal with heading 'Edit Task' and inputs pre-populated.
 *           Observed: Priority was pre-selected as "High" for the sample task (note: previous test assumed "Medium").
 * - [INFO] Previous test failure root cause: the Priority control is implemented as an ARIA combobox.
 *         Using selectOption on the combobox (which expects a native <select>) does not change the UI.
 *         This regenerated test interacts with the combobox by clicking it and selecting an option element.
 */

test.describe('US-06 Edit Task details via Modal', () => {
  test('should update task priority via modal from the dashboard', async ({ page }) => {
    // Step 1: Navigate to app and log in
    await page.goto(baseUrl);
    // Login page: ensure heading present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard landing
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Locate the target task by its title to scope interactions
    const taskTitle = 'Review related papers';
    const taskHeading = page.getByRole('heading', { name: taskTitle });
    await expect(taskHeading).toBeVisible();

    // Step 2: Click the 'Edit' button on the existing task in the list (scoped to the card)
    const taskCard = taskHeading.locator('..'); // parent container (card)
    const editButtonInCard = taskCard.getByRole('button', { name: 'Edit' });
    if (await editButtonInCard.count() > 0) {
      await editButtonInCard.first().click();
    } else {
      // fallback (should not be needed given observed markup)
      await page.getByRole('button', { name: 'Edit' }).first().click();
    }

    // Step 3: Verify edit modal opens and fields are pre-populated
    const modalHeading = page.getByRole('heading', { name: 'Edit Task' });
    await expect(modalHeading).toBeVisible();

    const titleInput = page.getByLabel('Title');
    const descriptionInput = page.getByLabel('Description');
    const priorityCombobox = page.getByLabel('Priority'); // this is an ARIA combobox in the app

    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');

    // Read current priority from the combobox (observe actual current value)
    const currentPriority = await priorityCombobox.inputValue();

    // Acceptance Criterion 4: Change the value in the 'Priority' field to a different option.
    // Choose an option different from currentPriority
    const possiblePriorities = ['Low', 'Medium', 'High'];
    const newPriority = possiblePriorities.find((p) => p !== currentPriority) ?? 'Low';

    // IMPORTANT: Priority is a combobox (ARIA). Interact by opening the combobox and clicking the option.
    await priorityCombobox.click();
    // Wait for the option to be present and click it
    const optionLocator = page.getByRole('option', { name: newPriority });
    await expect(optionLocator).toBeVisible();
    await optionLocator.click();

    // Verify the combobox reflects the newly chosen value before saving
    await expect(priorityCombobox).toHaveValue(newPriority);

    // Step 5: Click the 'Save' button.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Step 6: Verify that the edit modal closes automatically
    await expect(modalHeading).toHaveCount(0);

    // Wait for server/UI update: wait for the success notification (observed in the app)
    const successToast = page.getByText('Task updated successfully');
    await expect(successToast).toBeVisible();

    // Step 7: Verify that the task in the dashboard list now displays the updated Priority
    // Re-query the task card and assert the priority badge/text shows newPriority
    const updatedTaskHeading = page.getByRole('heading', { name: taskTitle });
    await expect(updatedTaskHeading).toBeVisible();
    const updatedCard = updatedTaskHeading.locator('..');

    // The priority is rendered as a simple text node in the card (observed markup).
    // Wait for the card to contain the expected priority text.
    await expect(updatedCard.getByText(newPriority)).toBeVisible();
  });
});