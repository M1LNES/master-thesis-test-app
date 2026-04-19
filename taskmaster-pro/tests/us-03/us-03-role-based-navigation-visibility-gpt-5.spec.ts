/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: 'System Settings' navigation tab is visible for admin (admin@test.com)
 * - [PASS] AC_02: 'System Settings' tab is absent from the DOM for standard user (user@test.com)
 * - [PASS] AC_03: Session changes immediately reflect role-based navigation after logout/login
 */

import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

async function login(page: Page, email: string, password: string = 'password123') {
  await page.goto(baseUrl);
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL('**/login');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}

test.describe('[US-03] Role-Based Navigation Visibility', () => {
  test('should render System Settings tab for admin users (AC_01)', async ({ page }) => {
    await login(page, 'admin@test.com');

    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toBeVisible();

    // Optional: verify the link navigates to the expected anchor
    await systemSettingsLink.click();
    await expect(page).toHaveURL(/#system-settings$/);

    await logout(page);
  });

  test('should omit System Settings tab from DOM for standard users (AC_02)', async ({ page }) => {
    await login(page, 'user@test.com');

    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    // Ensure element is physically absent from the DOM
    await expect(systemSettingsLink).toHaveCount(0);

    await logout(page);
  });

  test('should reflect role navigation after switching sessions (AC_03)', async ({ page }) => {
    // Admin login -> tab visible
    await login(page, 'admin@test.com');
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();

    // Logout -> User login -> tab absent
    await logout(page);
    await login(page, 'user@test.com');
    await expect(page.getByRole('link', { name: 'System Settings' })).toHaveCount(0);

    // Logout -> Admin login again -> tab visible
    await logout(page);
    await login(page, 'admin@test.com');
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();

    await logout(page);
  });
});