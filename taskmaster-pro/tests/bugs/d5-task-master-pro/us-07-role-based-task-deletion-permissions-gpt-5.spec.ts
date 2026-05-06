import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

/**
 * IMPLEMENTATION NOTES:
 * - [FAIL] AC_01 (Admin Access): No 'Delete' button is present on any task when logged in as admin. Only 'Edit' is available on each task card, and the Edit modal contains only 'Cancel' and 'Save Task'. Test marked with test.fail().
 * - [FAIL] AC_02 (User Restriction): As a standard user, the dashboard only lists the user's own task(s) and does not display admin-owned tasks to verify restrictions. Additionally, there is no 'Delete' button visible on any tasks. Test marked with test.fail().
 */

async function login(page: import('@playwright/test').Page, email: string, password = 'password123') {
  await page.goto(baseUrl);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Task list' })).toBeVisible();
}

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {
  test('should show Delete on all tasks for admin when viewing dashboard', async ({ page }) => {
    test.fail(true, "Current implementation does not render any 'Delete' button for admin; only 'Edit' is available.");

    await login(page, 'admin@test.com');

    const taskList = page.getByRole('region', { name: 'Task list' });
    const taskHeadings = taskList.getByRole('heading', { level: 3 });
    const taskCount = await taskHeadings.count();
    expect(taskCount).toBeGreaterThan(0);

    // Expected: one 'Delete' per task card (regardless of owner)
    const deleteButtons = taskList.getByRole('button', { name: /^Delete$/ });
    await expect(deleteButtons).toHaveCount(taskCount);
  });

  test('should only show Delete on user-owned tasks and strictly not on admin-owned tasks', async ({ page }) => {
    test.fail(true, "Standard user view does not include admin-owned tasks and no 'Delete' buttons are rendered, preventing verification.");

    await login(page, 'user@test.com');

    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList).toBeVisible();

    // Expected: both user-owned and admin-owned tasks are visible on the dashboard
    const userOwned = taskList.getByText('Owner: user@test.com');
    const adminOwned = taskList.getByText('Owner: admin@test.com');

    const userOwnedCount = await userOwned.count();
    const adminOwnedCount = await adminOwned.count();

    expect(userOwnedCount).toBeGreaterThan(0);
    expect(adminOwnedCount).toBeGreaterThan(0);

    // For each user-owned task, 'Delete' should be visible.
    for (let i = 0; i < userOwnedCount; i++) {
      const ownerLabel = userOwned.nth(i);
      // Scope to the nearest card container (ancestor div) and assert 'Delete' exists
      const card = ownerLabel.locator('xpath=ancestor::div[1]');
      await expect(card.getByRole('button', { name: /^Delete$/ })).toBeVisible();
    }

    // For each admin-owned task, 'Delete' should NOT be present in the DOM (strict absence).
    for (let i = 0; i < adminOwnedCount; i++) {
      const ownerLabel = adminOwned.nth(i);
      const card = ownerLabel.locator('xpath=ancestor::div[1]');
      await expect(card.getByRole('button', { name: /^Delete$/ })).toHaveCount(0);
    }
  });
});