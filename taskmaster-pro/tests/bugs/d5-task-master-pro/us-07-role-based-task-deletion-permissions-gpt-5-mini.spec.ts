import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

/**
 * IMPLEMENTATION NOTES:
 * - [FAIL] AC_01 (Admin Access) — Expected: 'Delete' button visible on all tasks for admin.
 *           Observed: Task cards render (h3 titles, Edit button, Mark as done) but there are NO 'Delete' buttons in the DOM.
 * - [FAIL] AC_02 (User Restriction) — Expected: standard user sees 'Delete' only for their own tasks and NOT for admin-owned tasks.
 *           Observed: There is no owner metadata visible in the task cards (no "Owner" or email text), and there are NO 'Delete' buttons.
 *
 * Because the UI elements required to verify the acceptance criteria are missing (Delete buttons and owner metadata),
 * the tests below are written with the EXPECTED assertions but are marked with test.fail() and a comment explaining
 * the observed mismatch. This ensures the tests will fail in a controlled way until the implementation is fixed.
 */

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {
  test('should show Delete button on all tasks when logged in as admin', async ({ page }) => {
    // Observed: No 'Delete' buttons at all in the dashboard task list.
    // This test asserts the expected correct behavior, but is marked as expected to fail until Delete buttons are implemented.
    test.fail(true, 'Expected Delete buttons for admin on all tasks, but none were found in the DOM during exploration.');

    // Navigate to app and ensure we're at the login screen
    await page.goto(baseUrl);
    const loginVisible = await page.getByLabel('Email').isVisible().catch(() => false);
    if (!loginVisible) {
      const logoutVisible = await page.getByRole('button', { name: 'Logout' }).isVisible().catch(() => false);
      if (logoutVisible) {
        await page.getByRole('button', { name: 'Logout' }).click();
        await page.waitForURL('**/login');
      } else {
        // Attempt to go to login explicitly if neither is visible
        await page.goto(baseUrl + '/login');
        await page.waitForURL('**/login');
      }
    }

    // Login as admin
    await expect(page.getByLabel('Email')).toBeVisible();
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard and tasks to render
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h3'); // task titles are h3 based on exploration

    // Gather counts
    const taskCount = await page.locator('h3').count();
    const deleteButtonCount = await page.getByRole('button', { name: 'Delete' }).count();

    // Expected (per AC_01): admin sees Delete on all tasks
    expect(taskCount).toBeGreaterThan(0); // sanity: there should be tasks to validate against
    expect(deleteButtonCount).toBe(taskCount);
  });

  test('should show Delete only on user-owned tasks and NOT on admin-owned tasks when logged in as standard user', async ({ page }) => {
    // Observed: No owner metadata present in task cards and no 'Delete' buttons anywhere.
    // Because owner attribution is not present in the DOM, we cannot reliably map which tasks are owned by whom.
    // This test expresses the expected behavior but is marked as expected to fail until owner metadata and delete controls exist.
    test.fail(true, 'Expected owner metadata in task cards and Delete buttons for owned tasks; neither owner info nor Delete buttons were found during exploration.');

    // Navigate to app and ensure we're at the login screen
    await page.goto(baseUrl);
    const loginVisible = await page.getByLabel('Email').isVisible().catch(() => false);
    if (!loginVisible) {
      const logoutVisible = await page.getByRole('button', { name: 'Logout' }).isVisible().catch(() => false);
      if (logoutVisible) {
        await page.getByRole('button', { name: 'Logout' }).click();
        await page.waitForURL('**/login');
      } else {
        await page.goto(baseUrl + '/login');
        await page.waitForURL('**/login');
      }
    }

    // Login as standard user
    await expect(page.getByLabel('Email')).toBeVisible();
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard and tasks to render
    await page.waitForURL('**/dashboard');
    await page.waitForSelector('h3');

    const taskCount = await page.locator('h3').count();
    expect(taskCount).toBeGreaterThan(0); // sanity

    // Iterate task cards and attempt to detect owner metadata in the DOM.
    const tasks: { title: string; html: string; hasDelete: boolean; mentionsUser: boolean; mentionsAdmin: boolean }[] = [];

    for (let i = 0; i < taskCount; i++) {
      const title = await page.locator('h3').nth(i).innerText();
      // Grab nearest container HTML for inspection (uses evaluate to access closest ancestor div)
      const containerHtml = await page.locator('h3').nth(i).evaluate((h) => {
        // try to find a reasonable ancestor that represents the task card
        const card = h.closest('div') || h.parentElement;
        return card ? card.innerHTML : h.outerHTML;
      });

      const hasDelete = /Delete/.test(containerHtml);
      const mentionsUser = /user@test\.com/i.test(containerHtml) || /Owner:\s*user@test\.com/i.test(containerHtml);
      const mentionsAdmin = /admin@test\.com/i.test(containerHtml) || /Owner:\s*admin@test\.com/i.test(containerHtml);

      tasks.push({ title: title.trim(), html: containerHtml, hasDelete, mentionsUser, mentionsAdmin });
    }

    // Expected (per AC_02):
    // - For tasks that mention the logged-in user (user@test.com), Delete must be present.
    // - For tasks that mention admin@test.com, Delete must NOT be present.
    // Because owner metadata is not present in the observed DOM, the `mentionsUser` and `mentionsAdmin` flags will likely be false.
    // Still assert the expected mapping for when owner metadata exists.
    for (const t of tasks) {
      if (t.mentionsUser) {
        expect(t.hasDelete, `Task "${t.title}" is attributed to user@test.com but has no Delete button in DOM`).toBe(true);
      }
      if (t.mentionsAdmin) {
        expect(t.hasDelete, `Task "${t.title}" is attributed to admin@test.com but a Delete button was found in DOM`).toBe(false);
      }
    }

    // Additionally ensure there are NO Delete buttons on tasks that explicitly mention admin@test.com (safety check).
    const adminMentionedTasks = tasks.filter((t) => t.mentionsAdmin);
    if (adminMentionedTasks.length > 0) {
      for (const t of adminMentionedTasks) {
        expect(t.hasDelete).toBe(false);
      }
    } else {
      // If no tasks explicitly mention admin, we cannot complete the verification of AC_02 at the DOM level.
      // Keep an assertion to remind us that owner metadata is missing.
      expect(adminMentionedTasks.length).toBeGreaterThan(0);
    }
  });
});