import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1: Login using user@test.com / password123 - test handles both login form present and already-authenticated sessions.
 * - [PASS] Criterion 2: Clicking 'Edit' on an existing task - 'Edit' button found in the Task list region.
 * - [PASS] Criterion 3: Edit modal opens and fields are pre-populated - Title, Description and Priority (Medium) observed pre-filled.
 * - [PASS] Criterion 4: Priority can be changed to a different option - combobox supports selecting 'Low'.
 * - [PASS] Criterion 5: Clicking 'Save' triggers save action - Save Task button exists and is clickable.
 * - [PASS] Criterion 6: Edit modal closes automatically after save - dialog becomes hidden after saving.
 * - [PASS] Criterion 7: Dashboard task list displays updated Priority - Task list region shows updated priority text.
 */

test.describe('[US-06] Edit Task details via Modal', () => {
  // Helper to ensure we're authenticated. If login form is present, perform login.
  async function ensureLoggedIn(page: Page) {
    await page.goto(baseUrl);
    // If Login form present, perform login
    const emailCount = await page.getByLabel('Email').count();
    if (emailCount > 0) {
      await page.getByLabel('Email').fill('user@test.com');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      // Wait for the dashboard to load (networkidle + logout button visible)
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    } else {
      // If login form not present, assert we're on the dashboard (logout visible)
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    }
  }

  test('should open edit modal with pre-populated fields, change Priority, save and reflect the update in the list', async ({ page }) => {
    // Step 1: Login
    await ensureLoggedIn(page);

    // Ensure Task list region is present
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // Confirm the task we will edit exists
    const taskHeading = taskList.getByRole('heading', { name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();

    // Step 2: Click the 'Edit' button on the existing task
    // Use the Edit button within the Task list region (first Edit for the card)
    const editButton = taskList.getByRole('button', { name: 'Edit' }).first();
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Step 3: Verify the edit modal opens and inputs are pre-populated
    const editDialog = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editDialog).toBeVisible();

    // Title and Description inputs
    const titleInput = page.getByLabel('Title');
    const descriptionInput = page.getByLabel('Description');

    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');

    // Priority combobox should have 'Medium' selected initially
    const priorityCombobox = page.getByRole('combobox', { name: 'Priority' });
    await expect(priorityCombobox).toBeVisible();
    // Verify option 'Medium' is selected
    const mediumOption = page.getByRole('option', { name: 'Medium' });
    await expect(mediumOption).toBeVisible();
    await expect(mediumOption).toBeSelected();

    // Step 4: Change the 'Priority' field to a different option (choose 'Low')
    await priorityCombobox.selectOption({ label: 'Low' });

    // Ensure 'Low' is now selected
    const lowOption = page.getByRole('option', { name: 'Low' });
    await expect(lowOption).toBeSelected();

    // Step 5: Click the 'Save' button (label observed as 'Save Task')
    const saveButton = editDialog.getByRole('button', { name: 'Save Task' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Step 6: Verify the edit modal closes automatically
    await expect(editDialog).toBeHidden();

    // Step 7: Verify that the task in the dashboard list now displays the updated Priority
    // Within the Task list region, the new priority text 'Low' should be visible,
    // and the old 'Medium' should no longer be visible for that region.
    await expect(taskList.getByText('Low')).toBeVisible();
    // It's possible other tasks use 'Medium' so we scope the negative check to be within the task card:
    // Locate the parent card that contains the heading, then assert it contains 'Low' and not 'Medium'.
    const taskCard = taskHeading.locator('xpath=ancestor::*[.//h3[normalize-space()="Review related papers"]]'); // narrow to ancestor container
    // Make sure the card contains 'Low' and does not contain 'Medium'
    await expect(taskCard.getByText('Low')).toBeVisible();
    await expect(taskCard.getByText('Medium')).toHaveCount(0);
  });
});