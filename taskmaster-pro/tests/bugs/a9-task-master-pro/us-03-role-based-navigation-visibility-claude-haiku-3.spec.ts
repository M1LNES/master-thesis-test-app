import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=a9u3kd1x';

test.describe('Role-Based Navigation Visibility', () => {
  test('should render System Settings tab for admin user', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('System Settings')).toBeVisible();
  });

  test('should omit System Settings tab for standard user', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('System Settings')).not.toBeVisible();
    await expect(page.getByText('System Settings')).not.toBeInDOM();
  });

  test('should reflect role-based navigation after logout and login', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('System Settings')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    // Login as standard user
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('System Settings')).not.toBeVisible();
  });
});