import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('US-03 Role-Based Navigation Visibility', () => {
  test('should render System Settings tab for admin (AC_01)', async ({ page }) => {
    // Navigate to login
    await page.goto(baseUrl + '/login');

    // Login as admin
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Assert that the System Settings link is present and visible
    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toBeVisible();
    // Ensure it's present exactly once in the DOM
    await expect(page.locator('text=System Settings')).toHaveCount(1);
  });

  test('should NOT render System Settings tab for standard user (AC_02)', async ({ page }) => {
    // Navigate to login
    await page.goto(baseUrl + '/login');

    // Login as standard user
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Verify the System Settings tab is strictly absent from the DOM (count === 0)
    // Using count ensures we check DOM presence, not just visibility.
    await expect(page.locator('text=System Settings')).toHaveCount(0);
  });

  test('should reflect role navigation immediately after logout/login (AC_03)', async ({ page }) => {
    // 1) Login as admin and assert System Settings is present
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
    await expect(page.locator('text=System Settings')).toHaveCount(1);

    // 2) Logout and ensure we are back at login
    // Prefer role-based locator for logout
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    if ((await logoutButton.count()) > 0) {
      await logoutButton.click();
    } else {
      // fallback to link if button not present
      const logoutLink = page.getByRole('link', { name: 'Logout' });
      await logoutLink.click();
    }
    await page.waitForURL('**/login', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // 3) Login as standard user and assert System Settings is absent from the DOM
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // System Settings must be physically absent from the DOM for standard users
    await expect(page.locator('text=System Settings')).toHaveCount(0);
  });
});