import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('AC_01 (Admin Access) - Admin can delete all tasks', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify admin can see delete button on all tasks
    const taskDeleteButtons = await page.getByRole('button', { name: 'Delete' }).all();
    expect(taskDeleteButtons.length).toBeGreaterThan(0);
    for (const button of taskDeleteButtons) {
      expect(await button.isVisible()).toBe(true);
    }
  });

  test('AC_02 (User Restriction) - Regular user can only delete their own tasks', async ({ page }) => {
    // Login as regular user
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // Verify user can only see delete button on their own tasks
    const userTaskDeleteButtons = await page.getByRole('button', { name: 'Delete' }).filter({
      has: page.getByText('Assigned to: user@test.com')
    });
    expect(userTaskDeleteButtons.length).toBeGreaterThan(0);
    for (const button of userTaskDeleteButtons) {
      expect(await button.isVisible()).toBe(true);
    }

    const adminTaskDeleteButtons = await page.getByRole('button', { name: 'Delete' }).filter({
      has: page.getByText('Assigned to: admin@test.com')
    });
    expect(adminTaskDeleteButtons.length).toBe(0);
  });
});