import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + '/login');
  });

  const login = async (page: any, email: string) => {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  };

  test('AC_01: Admin should see delete button on all tasks', async ({ page }) => {
    await login(page, adminEmail);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Task owned by admin
    const adminTask1 = page.locator('div').filter({ hasText: 'Prepare thesis proposalOwner: admin@test.com' }).first();
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Task owned by user
    const userTask = page.locator('div').filter({ hasText: 'Review related papersOwner: user@test.com' }).first();
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // Another task owned by admin
    const adminTask2 = page.locator('div').filter({ hasText: 'Set up E2E baselineOwner: admin@test.com' }).first();
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('AC_02: User should only see delete button on their own tasks', async ({ page }) => {
    await login(page, userEmail);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Verify user sees their own task and its delete button
    const userTask = page.locator('div').filter({ hasText: 'Review related papers' }).first();
    await expect(userTask).toBeVisible();
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Verify tasks owned by admin are not visible to the user
    // This implicitly confirms the user cannot see the delete button for these tasks
    const adminTask1 = page.locator('div').filter({ hasText: 'Prepare thesis proposal' }).first();
    await expect(adminTask1).not.toBeVisible();

    const adminTask2 = page.locator('div').filter({ hasText: 'Set up E2E baseline' }).first();
    await expect(adminTask2).not.toBeVisible();
  });

});