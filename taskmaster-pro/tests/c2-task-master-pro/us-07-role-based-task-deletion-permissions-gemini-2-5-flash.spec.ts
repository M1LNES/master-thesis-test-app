/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): The admin user can see the 'Delete' button on all tasks, regardless of their owner.
 * - [FAIL] AC_02 (User Restriction): The standard user can see the 'Delete' button on tasks owned by the administrator, which contradicts the acceptance criteria. The test is written to assert the EXPECTED behavior (delete button not visible) and is wrapped with `test.fail()`.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

test.describe('Role-Based Task Deletion Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + '/login');
  });

  test.describe('Admin User Role', () => {
    test('should see the "Delete" button on all tasks', async ({ page }) => {
      await page.getByLabel('Email').fill(adminEmail);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('**/dashboard');

      // AC_01: Admin should see 'Delete' button on all tasks
      // Task owned by admin@test.com
      const adminTask1Card = page.locator('div', { has: page.getByRole('heading', { name: 'Prepare thesis proposal', level: 3 }) });
      await expect(adminTask1Card.getByRole('button', { name: 'Delete' })).toBeVisible();

      // Task owned by user@test.com
      const userTaskCard = page.locator('div', { has: page.getByRole('heading', { name: 'Review related papers', level: 3 }) });
      await expect(userTaskCard.getByRole('button', { name: 'Delete' })).toBeVisible();

      // Another task owned by admin@test.com
      const adminTask2Card = page.locator('div', { has: page.getByRole('heading', { name: 'Set up E2E baseline', level: 3 }) });
      await expect(adminTask2Card.getByRole('button', { name: 'Delete' })).toBeVisible();
    });
  });

  test.describe('Standard User Role', () => {
    test('should only see the "Delete" button on tasks owned by me', async ({ page }) => {
      test.fail(); // Implementation allows standard users to see delete buttons on admin's tasks

      await page.getByLabel('Email').fill(userEmail);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('**/dashboard');

      // AC_02: User should see 'Delete' button on tasks owned by them
      const userTaskCard = page.locator('div', { has: page.getByRole('heading', { name: 'Review related papers', level: 3 }) });
      await expect(userTaskCard.getByRole('button', { name: 'Delete' })).toBeVisible();

      // AC_02: User should NOT see 'Delete' button on tasks owned by administrator
      const adminTask1Card = page.locator('div', { has: page.getByRole('heading', { name: 'Prepare thesis proposal', level: 3 }) });
      await expect(adminTask1Card.getByRole('button', { name: 'Delete' })).not.toBeVisible();

      const adminTask2Card = page.locator('div', { has: page.getByRole('heading', { name: 'Set up E2E baseline', level: 3 }) });
      await expect(adminTask2Card.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    });
  });
});