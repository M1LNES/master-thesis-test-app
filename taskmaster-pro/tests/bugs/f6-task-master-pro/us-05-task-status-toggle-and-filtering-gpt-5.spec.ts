import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login works and navigates to /dashboard
 * - [PASS] Toggling the task status checkbox updates to checked (completed)
 * - [FAIL] 'Active' filter does not hide the completed task (task remains visible after selecting 'Active')
 * - [PASS] 'Completed' filter shows the completed task (but since it never hides under 'Active', the end-to-end filter flow fails)
 */

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(baseUrl);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { level: 1, name: 'TaskMaster Pro' })).toBeVisible();
}

test.describe('[US-05] Task Status Toggle and Filtering', () => {
  test('should mark task as completed when status checkbox is clicked', async ({ page }) => {
    await login(page, 'user@test.com', 'password123');

    const taskHeading = page.getByRole('heading', { level: 3, name: 'Review related papers' });
    await expect(taskHeading).toBeVisible();

    // Ensure the task is initially active (unchecked), then mark as done
    const statusCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    await expect(statusCheckbox).toBeVisible();
    await expect(statusCheckbox).not.toBeChecked();

    await statusCheckbox.click();

    // Verify the checkbox is now checked
    await expect(statusCheckbox).toBeChecked();
  });

  test('should hide completed task under Active and show under Completed after filtering', async ({ page }) => {
    test.fail(); // Active filter currently does not hide the completed task; observed task remains visible after selecting 'Active'

    await login(page, 'user@test.com', 'password123');

    const taskHeading = page.getByRole('heading', { level: 3, name: 'Review related papers' });
    const statusCheckbox = page.getByRole('checkbox', { name: 'Mark as done' });
    const taskList = page.getByRole('region', { name: 'Task list' });

    // Precondition: mark the task as completed
    await expect(taskHeading).toBeVisible();
    await expect(statusCheckbox).toBeVisible();
    const isChecked = await statusCheckbox.isChecked();
    if (!isChecked) {
      await statusCheckbox.click();
      await expect(statusCheckbox).toBeChecked();
    }

    // Apply 'Active' filter and wait for potential updates
    await page.getByRole('radio', { name: 'Active' }).click();
    await page.waitForLoadState('networkidle'); // explicit wait as per spec
    await taskList.waitFor(); // ensure the list region is stable

    // Verify the completed task is no longer visible in Active
    await expect(taskHeading).toBeHidden();

    // Switch to 'Completed' filter and verify the task is visible again
    await page.getByRole('radio', { name: 'Completed' }).click();
    await page.waitForLoadState('networkidle'); // explicit wait as per spec
    await taskList.waitFor();

    await expect(taskHeading).toBeVisible();
  });
});