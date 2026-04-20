/**
 * IMPLEMENTATION NOTES:
 * - [FAIL] AC_01 (Admin Access): The 'Delete' button is not visible on any tasks for the admin user. The feature appears to be missing. The test asserts the expected behavior and is marked with `test.fail()`.
 * - [FAIL] AC_02 (User Restriction): The 'Delete' button is not visible on the user's own tasks. Additionally, tasks owned by other users are not visible at all, which deviates from the AC's implication that users would see others' tasks but without a delete option. The test asserts the expected behavior for the user's own task and is marked with `test.fail()`.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('AC_01: should allow admin to see Delete button on all tasks', async ({ page }) => {
    // This test is expected to fail because the 'Delete' button is not implemented.
    test.fail();

    // Given I am successfully logged in as an administrator
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // When I view the dashboard task list
    const adminTask1 = page.locator('article').filter({ hasText: 'Prepare thesis proposal' });
    const userTask = page.locator('article').filter({ hasText: 'Review related papers' });
    const adminTask2 = page.locator('article').filter({ hasText: 'Set up E2E baseline' });

    // Then I should see the 'Delete' button on all tasks regardless of their owner
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();

    // A more concise way to check is to count all visible delete buttons
    await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(3);
  });

  test('AC_02: should only allow user to see Delete button on their own tasks', async ({ page }) => {
    // This test is expected to fail because the 'Delete' button is not implemented.
    test.fail();

    // Given I am successfully logged in as a standard user
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    // When I view the dashboard task list
    const userOwnedTask = page.locator('article').filter({ hasText: 'Review related papers' });
    const adminOwnedTask = page.locator('article').filter({ hasText: 'Prepare thesis proposal' });

    // Then I should only see the 'Delete' button on tasks owned by me
    await expect(userOwnedTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // And I should strictly NOT see the 'Delete' button on tasks owned by the administrator
    // Note: The current implementation hides other users' tasks entirely. 
    // This assertion checks the AC's intent that the task would be visible but without the button.
    await expect(adminOwnedTask).toBeVisible(); // This will fail as the task is hidden
    await expect(adminOwnedTask.getByRole('button', { name: 'Delete' })).toBeHidden();
  });
});