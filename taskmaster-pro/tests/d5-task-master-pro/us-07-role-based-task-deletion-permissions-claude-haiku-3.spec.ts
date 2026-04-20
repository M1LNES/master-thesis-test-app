import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=d5k7mt2z';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should allow admin to delete all tasks', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify admin can see delete button on all tasks
    const taskDeleteButtons = await page.getByRole('button', { name: 'Delete' }).all();
    expect(taskDeleteButtons).toHaveLength(3); // Assuming 3 tasks on the dashboard
    for (const button of taskDeleteButtons) {
      expect(await button.isVisible()).toBe(true);
    }
  });

  test('should restrict user from deleting tasks not owned by them', async ({ page }) => {
    // Login as regular user
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify user can only see delete button on their own tasks
    const userTaskDeleteButtons = await page.getByRole('button', { name: 'Delete', scope: page.getByText('User Task') }).all();
    const adminTaskDeleteButtons = await page.getByRole('button', { name: 'Delete', scope: page.getByText('Admin Task') }).all();

    expect(userTaskDeleteButtons).toHaveLength(1);
    expect(await userTaskDeleteButtons[0].isVisible()).toBe(true);

    expect(adminTaskDeleteButtons).toHaveLength(1);
    expect(await adminTaskDeleteButtons[0].isVisible()).toBe(false);
  });
});