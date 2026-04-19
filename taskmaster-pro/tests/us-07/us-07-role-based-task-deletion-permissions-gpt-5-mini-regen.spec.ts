import { test, expect, Locator } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access) — Observed when logging in as admin@test.com:
 *         - Dashboard shows 3 tasks (2 owned by admin@test.com, 1 by user@test.com)
 *         - There are 3 visible 'Delete' buttons (one per task). Admin can see Delete on all tasks.
 * - [PASS] AC_02 (User Restriction) — Observed when logging in as user@test.com:
 *         - Dashboard view shows only the user's task (no admin-owned tasks visible in the UI under this account).
 *         - The user's task has a visible 'Delete' button.
 *         - No admin-owned tasks were present in the DOM for the standard user (so there are no Delete buttons for admin tasks).
 *
 * Notes:
 * - Selectors used are only those observed during exploration:
 *   - Login: getByLabel('Email'), getByLabel('Password'), getByRole('button', { name: 'Login' })
 *   - Dashboard tasks: headings (role=heading level=3), text nodes 'Owner: admin@test.com' and 'Owner: user@test.com', and buttons 'Delete'
 * - Absence of Delete on admin tasks is verified at the DOM level by querying the task container for a Delete button.
 */

test.describe('US-07 Role-Based Task Deletion Permissions', () => {
  test('should show Delete button on all tasks for administrator (admin@test.com)', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Collect all task headings (observed as level 3 headings)
    const taskHeadings = page.getByRole('heading', { level: 3 });
    const taskCount = await taskHeadings.count();
    expect(taskCount).toBeGreaterThan(0); // ensure there are tasks to assert against

    // For each task container, assert a 'Delete' button is present (admin should see Delete for every task)
    for (let i = 0; i < taskCount; i++) {
      const heading = taskHeadings.nth(i);

      // Find the nearest ancestor container that also contains the Owner text and action buttons.
      // This uses an XPath ancestor traversal to get the task block observed in the app snapshot.
      const taskContainer = heading.locator('xpath=ancestor::*[.//text()[contains(.,"Owner:")]]').first();

      // Verify owner is discoverable (helps ensure we're inspecting a task block)
      const hasAdminOwner = (await taskContainer.locator('text=Owner: admin@test.com').count()) > 0;
      const hasUserOwner = (await taskContainer.locator('text=Owner: user@test.com').count()) > 0;
      expect(hasAdminOwner || hasUserOwner).toBeTruthy();

      // Assert the Delete button is present and visible inside this task container
      const deleteButton = taskContainer.getByRole('button', { name: 'Delete' });
      await expect(deleteButton).toBeVisible();
    }

    // Additionally assert total Delete buttons equals number of tasks
    const totalDeleteButtons = await page.getByRole('button', { name: 'Delete' }).count();
    expect(totalDeleteButtons).toBe(taskCount);
  });

  test('should allow standard user (user@test.com) to delete only their own tasks and not admin tasks', async ({ page }) => {
    // Login as standard user
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Collect all task headings (role=heading level=3)
    const taskHeadings = page.getByRole('heading', { level: 3 });
    const taskCount = await taskHeadings.count();

    // If there are no tasks, that's acceptable (user has no tasks) — but still assert behavior regarding admin tasks.
    // We will iterate tasks if present; additionally check whether any admin-owned task is present in the DOM.
    const adminOwnerLocators = page.locator('text=Owner: admin@test.com');
    const adminVisibleCount = await adminOwnerLocators.count();

    // If admin-owned tasks are present in the DOM for a standard user, ensure they DO NOT contain a Delete button.
    if (adminVisibleCount > 0) {
      for (let i = 0; i < adminVisibleCount; i++) {
        const adminOwner = adminOwnerLocators.nth(i);
        // ascend to the task container that corresponds to this owner label
        const taskContainer = adminOwner.locator('xpath=ancestor::*[.//text()[contains(.,"Owner:")]]').first();
        const deleteButtonsInAdminTask = await taskContainer.getByRole('button', { name: 'Delete' }).count();
        // Strict DOM-level absence required by specification
        expect(deleteButtonsInAdminTask).toBe(0);
      }
    }

    // For tasks that are present, ensure user-owned tasks have a visible Delete button and non-user tasks do not.
    for (let i = 0; i < taskCount; i++) {
      const heading = taskHeadings.nth(i);
      const taskContainer = heading.locator('xpath=ancestor::*[.//text()[contains(.,"Owner:")]]').first();

      const isUserOwned = (await taskContainer.locator('text=Owner: user@test.com').count()) > 0;
      const isAdminOwned = (await taskContainer.locator('text=Owner: admin@test.com').count()) > 0;

      // Determine presence of delete button in this container
      const deleteButtonCount = await taskContainer.getByRole('button', { name: 'Delete' }).count();

      if (isUserOwned) {
        // User must be able to delete their own tasks (Delete button visible)
        expect(deleteButtonCount).toBeGreaterThan(0);
        const deleteButton = taskContainer.getByRole('button', { name: 'Delete' });
        await expect(deleteButton).toBeVisible();
      } else if (isAdminOwned) {
        // Strictly NOT see the Delete button on admin-owned tasks (DOM-level absence)
        expect(deleteButtonCount).toBe(0);
      } else {
        // If neither owner label is found, fail the test because task ownership cannot be determined
        throw new Error('Found a task whose owner could not be determined via expected owner labels.');
      }
    }

    // Final sanity assertions:
    // - If admin-owned tasks are completely absent from the DOM, that's acceptable and satisfies "should strictly NOT see the Delete button on tasks owned by the administrator".
    // - Ensure that at least the user's own tasks (if any) have Delete buttons.
    const userOwnerLocators = page.locator('text=Owner: user@test.com');
    const userVisibleCount = await userOwnerLocators.count();
    if (userVisibleCount > 0) {
      for (let i = 0; i < userVisibleCount; i++) {
        const userOwner = userOwnerLocators.nth(i);
        const taskContainer = userOwner.locator('xpath=ancestor::*[.//text()[contains(.,"Owner:")]]').first();
        const deleteCount = await taskContainer.getByRole('button', { name: 'Delete' }).count();
        expect(deleteCount).toBeGreaterThan(0);
      }
    } else {
      // No user tasks visible — that's acceptable; but at least ensure there is not a Delete button floating unrelated to ownership (optional sanity).
      const allDeleteButtons = await page.getByRole('button', { name: 'Delete' }).count();
      // If there are delete buttons but no user-owned tasks, that's unexpected for the standard user.
      if (allDeleteButtons > 0) {
        throw new Error('Unexpected Delete buttons present while no user-owned tasks are visible.');
      }
    }
  });
});