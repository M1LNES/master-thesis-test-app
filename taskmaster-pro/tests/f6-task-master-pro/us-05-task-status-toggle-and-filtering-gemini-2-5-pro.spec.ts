/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Criterion 1, 2, 3: User can log in, locate a task, and click its checkbox. The checkbox state updates correctly to 'checked'.
 * - [FAIL] Criterion 5: After marking a task as completed and clicking the 'Active' filter, the completed task is NOT hidden from the list. The filtering logic appears to be missing or broken, as the task list does not update.
 * - [FAIL] Criterion 7: After clicking the 'Completed' filter, the task is visible. However, this is not a true pass because the task was never hidden in the first place. The filter is not functioning as expected. The test asserts the correct final state but is marked as failing due to the broken intermediate step.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should filter tasks correctly after marking one as complete', async ({ page }) => {
    // This test is expected to fail because the filtering functionality is not implemented correctly.
    test.fail(true, 'Task filtering does not update the task list when a filter is applied.');

    // 1. Log in using user@test.com and password123.
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Define the task to be used in the test
    const taskName = 'Review related papers';
    // Locate the specific task container by its heading text to ensure actions are scoped correctly.
    const taskContainer = page.locator('article').filter({ hasText: taskName });

    // 2. Locate an active task in the list and click its status checkbox.
    const taskCheckbox = taskContainer.getByRole('checkbox', { name: 'Mark as done' });
    await taskCheckbox.click();

    // 3. Verify that the checkbox reflects the checked state (marked as completed).
    await expect(taskCheckbox).toBeChecked();

    // 4. Click the 'Active' filter button/radio.
    await page.getByRole('radio', { name: 'Active' }).click();

    // 5. Verify that the task you just marked as completed is no longer visible in the task list.
    // This is the step that is expected to fail.
    await expect(taskContainer).toBeHidden();

    // 6. Click the 'Completed' filter button/radio.
    await page.getByRole('radio', { name: 'Completed' }).click();

    // 7. Verify that the completed task is now visible in the list again.
    await expect(taskContainer).toBeVisible();
  });
});