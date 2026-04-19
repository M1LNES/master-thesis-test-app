import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should allow admin to delete any task', async ({ page }) => {
    // Login as admin
    await page.goto(`${baseUrl}/login`);
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify admin can see 'Delete' button on all tasks
    await page.goto(`${baseUrl}/dashboard`);
    const taskDeleteButtons = await page.getByRole('button', { name: 'Delete' }).all();
    expect(taskDeleteButtons.length).toBeGreaterThan(0);
    for (const button of taskDeleteButtons) {
      expect(await button.isVisible()).toBe(true);
    }
  });

  test('should restrict user from deleting tasks not owned by them', async ({ page }) => {
    // Login as standard user
    await page.goto(`${baseUrl}/login`);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify user can only see 'Delete' button on their own tasks
    await page.goto(`${baseUrl}/dashboard`);
    const userTaskDeleteButtons = await page.getByRole('button', { name: 'Delete', scope: await page.getByText('User Tasks') }).all();
    const adminTaskDeleteButtons = await page.getByRole('button', { name: 'Delete', scope: await page.getByText('Admin Tasks') }).all();

    expect(userTaskDeleteButtons.length).toBeGreaterThan(0);
    for (const button of userTaskDeleteButtons) {
      expect(await button.isVisible()).toBe(true);
    }

    expect(adminTaskDeleteButtons.length).toBe(0);
  });
});