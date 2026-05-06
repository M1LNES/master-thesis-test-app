import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with valid credentials navigates to Dashboard.
 * - [PASS] Clicking 'Edit' opens the Edit Task modal with fields pre-populated (Title, Description, Priority).
 * - [PASS] Changing 'Priority' and saving updates the task priority shown on the dashboard list.
 * - [FAIL] Modal should close automatically after saving — observed that the "Edit Task" dialog remains present after save.
 */

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should open edit modal with pre-populated fields and update priority when saved', async ({ page }) => {
    // Step 1: Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { level: 1, name: 'TaskMaster Pro' })).toBeVisible();

    // Step 2: Click 'Edit' on an existing task
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();
    await taskList.getByRole('button', { name: 'Edit' }).click();

    // Step 3: Verify edit modal opens and fields are pre-populated
    const dialog = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(dialog).toBeVisible();

    // Pre-populated checks against the deterministic seed data
    await expect(dialog.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(dialog.getByLabel('Description')).toHaveValue(
      'Summarize 5 papers and compare methodology sections.'
    );
    await expect(dialog.getByLabel('Priority')).toHaveValue('Medium');

    // Step 4: Change 'Priority' to a different option
    await dialog.getByLabel('Priority').selectOption('High');

    // Step 5: Click 'Save'
    await dialog.getByRole('button', { name: 'Save Task' }).click();

    // Optional toast verification (not in AC but helpful signal)
    await expect(page.getByText('Task updated successfully')).toBeVisible();

    // Step 7: Verify the task in the dashboard now displays updated Priority
    const taskHeading = taskList.getByRole('heading', { level: 3, name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();
    // Scope to the card container by going to the parent of the heading then asserting 'High' is present
    const cardContainer = taskHeading.locator('..');
    await expect(cardContainer.getByText('High')).toBeVisible();
  });

  test('should close edit modal automatically after saving', async ({ page }) => {
    // Known issue: dialog remains after saving; expected behavior is it should close automatically.
    test.fail(true, 'Observed that the "Edit Task" dialog remains present after saving.');

    // Step 1: Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { level: 1, name: 'TaskMaster Pro' })).toBeVisible();

    // Open edit modal
    const taskList = page.getByRole('region', { name: 'Task list' });
    await taskList.getByRole('button', { name: 'Edit' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(dialog).toBeVisible();

    // Change priority and save
    await dialog.getByLabel('Priority').selectOption('Low'); // choose a different option
    await dialog.getByRole('button', { name: 'Save Task' }).click();

    // Step 6: Verify modal closes automatically (expected correct behavior)
    await expect(dialog).toBeHidden();
  });
});