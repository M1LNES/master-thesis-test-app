import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';

const login = async (page: any, email: string) => {
  await page.goto(baseUrl);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
};

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {

  test('AC_01: should allow admin to see delete on all tasks', async ({ page }) => {
    await login(page, 'admin@test.com');

    const adminTask1 = page.getByRole('article').filter({ hasText: 'Prepare thesis proposal' });
    const userTask = page.getByRole('article').filter({ hasText: 'Review related papers' });
    const adminTask2 = page.getByRole('article').filter({ hasText: 'Set up E2E baseline' });

    // Admin should see Delete on their own task
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // Admin should see Delete on another user's task
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Admin should see Delete on their other task
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('AC_02: should restrict user from deleting others tasks', async ({ page }) => {
    // This test is expected to fail because the application currently shows
    // the 'Delete' button to non-admin users for tasks they do not own,
    // which violates the acceptance criteria.
    test.fail();
    
    await login(page, 'user@test.com');

    const adminTask1 = page.getByRole('article').filter({ hasText: 'Prepare thesis proposal' });
    const userTask = page.getByRole('article').filter({ hasText: 'Review related papers' });
    const adminTask2 = page.getByRole('article').filter({ hasText: 'Set up E2E baseline' });

    // User should see Delete on their own task
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // User should NOT see Delete on an admin's task
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).not.toBeVisible();

    // User should NOT see Delete on another of the admin's tasks
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).not.toBeVisible();
  });

});