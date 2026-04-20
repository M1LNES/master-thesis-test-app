import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] All acceptance criteria are met, except for the modal closing automatically after saving.
 * - [FAIL] Acceptance Criterion #6: "Verify that the edit modal closes automatically." - The modal currently remains open after the task is saved, although a success toast appears and the underlying data is updated. The test asserts the expected behavior (modal closes) and is marked with test.fail() until the implementation is fixed.
 */
test.describe('[US-06] Edit Task details via Modal', () => {
  test.fail(true, 'The edit modal does not close automatically after saving the task.');

  test('should open edit modal, update priority, and reflect change on the dashboard', async ({ page }) => {
    // 1. Log in
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Find the task card and its initial priority
    const taskCard = page.locator('article').filter({ hasText: 'Review related papers' });
    const initialPriority = taskCard.getByText('Medium');
    await expect(initialPriority).toBeVisible();

    // 2. Click the 'Edit' button on an existing task
    await taskCard.getByRole('button', { name: 'Edit' }).click();

    // 3. Verify that the edit modal opens and is pre-populated
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    await expect(editModal.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(editModal.getByLabel('Description')).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(editModal.getByLabel('Priority')).toHaveValue('Medium');

    // 4. Change the value in the 'Priority' field
    await editModal.getByLabel('Priority').selectOption('High');
    await expect(editModal.getByLabel('Priority')).toHaveValue('High');

    // 5. Click the 'Save' button
    await editModal.getByRole('button', { name: 'Save Task' }).click();

    // 6. Verify that the edit modal closes automatically
    // This is the step that is expected to fail based on current implementation.
    await expect(editModal).not.toBeVisible();

    // 7. Verify that the task in the dashboard list now displays the updated Priority
    const updatedPriority = taskCard.getByText('High');
    await expect(updatedPriority).toBeVisible();
    await expect(initialPriority).not.toBeVisible();
  });
});