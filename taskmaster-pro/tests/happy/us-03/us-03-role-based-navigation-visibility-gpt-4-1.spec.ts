/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: As admin, 'System Settings' navigation tab is present in the header after login.
 * - [PASS] AC_02: As regular user, 'System Settings' tab is physically absent from the DOM after login.
 * - [PASS] AC_03: Logging out and logging in as a different role immediately updates navigation permissions.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Navigation Visibility', () => {
  test('should show "System Settings" tab for admin after login', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/dashboard/);

    // Assert 'System Settings' tab is visible in the header
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
  });

  test('should NOT render "System Settings" tab for regular user after login', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page).toHaveURL(/dashboard/);

    // Assert 'System Settings' tab is not present in the DOM at all
    const systemSettings = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettings).toHaveCount(0);
  });

  test('should update navigation tabs immediately after switching roles (session boundary)', async ({ page }) => {
    // Login as admin first
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Assert 'System Settings' is present
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/login/);

    // Login as regular user
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Assert 'System Settings' is not present in the DOM
    const systemSettings = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettings).toHaveCount(0);

    // Logout again to clean up
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/login/);
  });
});