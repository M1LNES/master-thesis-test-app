/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: As admin (admin@test.com), the dashboard shows multiple tasks and each task has a visible 'Delete' button. Verified that the number of 'Delete' buttons equals the number of task cards. Also observed both owner labels: 'Owner: admin@test.com' and 'Owner: user@test.com'.
 * - [FAIL] AC_02: As a standard user (user@test.com), the dashboard only lists the user's own task(s); admin-owned tasks are not rendered at all. This prevents verifying that admin-owned tasks are visible without a 'Delete' button. The corresponding test is marked with test.fail() and asserts the expected (spec) behavior so it will flip to passing when the implementation aligns with the acceptance criteria.
 */

import { test, expect, Page, Locator } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto(baseUrl);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
}

function taskCardByTitleAndSnippet(region: Locator, title: string, snippet: string): Locator {
  // Narrow to a container div that includes both a specific H3 heading and a unique snippet of its description.
  return region
    .locator('div')
    .filter({ has: region.getByRole('heading', { level: 3, name: title }) })
    .filter({ hasText: snippet })
    .first();
}

test.describe('US-07 Role-Based Task Deletion Permissions', () => {
  test('should show Delete button on all tasks for admin when viewing the dashboard task list (AC_01)', async ({ page }) => {
    await login(page, 'admin@test.com', 'password123');

    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // Verify we have multiple tasks and a Delete button for each
    const taskHeadings = taskList.getByRole('heading', { level: 3 });
    const taskCount = await taskHeadings.count();
    expect(taskCount).toBeGreaterThan(0);

    const deleteButtons = taskList.getByRole('button', { name: 'Delete' });
    await expect(deleteButtons).toHaveCount(taskCount);

    // Additionally confirm both owners appear in the list for coverage across owners
    await expect(taskList.getByText('Owner: admin@test.com')).toBeVisible();
    await expect(taskList.getByText('Owner: user@test.com')).toBeVisible();
  });

  test('should only show Delete on user-owned tasks and not on admin-owned tasks when viewing the dashboard (AC_02)', async ({ page }) => {
    // Current implementation does not render admin-owned tasks for the standard user,
    // making it impossible to assert the absence of Delete on those tasks.
    // Marking this as expected to fail until implementation matches the spec.
    test.fail();

    await login(page, 'user@test.com', 'password123');

    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // User-owned task (observed as "Review related papers")
    const myTask = taskCardByTitleAndSnippet(
      taskList,
      'Review related papers',
      'Summarize 5 papers'
    );
    await expect(myTask).toBeVisible();
    // User should see a Delete button on their own task
    await expect(myTask.getByRole('button', { name: 'Delete' })).toHaveCount(1);

    // Admin-owned tasks should be visible but must NOT have Delete for the standard user
    const adminTask1 = taskCardByTitleAndSnippet(
      taskList,
      'Prepare thesis proposal',
      'Draft the scope and timeline'
    );
    await expect(adminTask1).toBeVisible();
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toHaveCount(0); // DOM-level absence

    const adminTask2 = taskCardByTitleAndSnippet(
      taskList,
      'Set up E2E baseline',
      'Create deterministic test scenarios'
    );
    await expect(adminTask2).toBeVisible();
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toHaveCount(0); // DOM-level absence
  });
});