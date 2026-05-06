/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): As admin, 'Delete' button is visible on all tasks, including those owned by admin@test.com and user@test.com.
 * - [FAIL] AC_02 (User Restriction): Expected 'Delete' to appear only on user's own tasks and not on admin-owned tasks. Observed that 'Delete' is present on all tasks for user@test.com and owner labels are not shown. Test marked with test.fail() and asserts expected behavior.
 */

import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';

async function loginAs(page: Page, email: string, password = 'password123'): Promise<void> {
  await page.goto(baseUrl);

  const loginBtn = page.getByRole('button', { name: 'Login' });
  // If already on dashboard, log out to ensure fresh session
  if (!(await loginBtn.isVisible().catch(() => false))) {
    const logoutBtn = page.getByRole('button', { name: 'Logout' });
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }
    await expect(loginBtn).toBeVisible();
  }

  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await loginBtn.click();

  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('region', { name: 'Task list' })).toBeVisible();
}

function taskCardByTitle(page: Page, title: string) {
  const taskList = page.getByRole('region', { name: 'Task list' });
  // Find a container <div> that has the target heading inside
  return taskList.locator('div', { has: page.getByRole('heading', { name: title }) });
}

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {
  const adminOwnedTasks = ['Prepare thesis proposal', 'Set up E2E baseline'];
  const userOwnedTask = 'Review related papers';
  const allTasks = [...adminOwnedTasks, userOwnedTask];

  test('should show Delete button on all tasks for admin when viewing the dashboard', async ({ page }) => {
    await loginAs(page, 'admin@test.com');

    // Validate each known task is present and has a Delete button
    for (const title of allTasks) {
      const card = taskCardByTitle(page, title);
      await expect(card).toHaveCount(1);
      await expect(card.getByRole('button', { name: 'Delete' })).toBeVisible();
    }
  });

  test('should only show Delete button on user-owned tasks and not on admin-owned tasks for standard user', async ({ page }) => {
    // Observed behavior contradicts AC_02: 'Delete' is visible on all tasks for user@test.com.
    // Marking expected correct behavior to fail until implementation is fixed.
    test.fail();

    await loginAs(page, 'user@test.com');

    // Positive: user can delete their own task
    {
      const card = taskCardByTitle(page, userOwnedTask);
      await expect(card).toHaveCount(1);
      await expect(card.getByRole('button', { name: 'Delete' })).toBeVisible();
    }

    // Negative: ensure admin-owned tasks do NOT render the 'Delete' button at the DOM level
    for (const title of adminOwnedTasks) {
      const card = taskCardByTitle(page, title);
      await expect(card).toHaveCount(1);
      // DOM-level absence check (strict): element should not be present at all
      await expect(card.getByRole('button', { name: 'Delete' })).toHaveCount(0);
    }
  });
});