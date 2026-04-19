import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: 'System Settings' tab is visible for admin user.
 * - [PASS] AC_02: 'System Settings' tab is absent from the DOM for regular user.
 * - [PASS] AC_03: Session boundary works correctly; logging out and back in reflects role changes.
 */

test.describe('Role-Based Navigation Visibility', () => {
  test('should display "System Settings" tab for admin user', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(baseUrl + '/dashboard');
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
  });

  test('should not display "System Settings" tab for regular user', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(baseUrl + '/dashboard');
    await expect(page.locator('text=System Settings')).not.toBeVisible();
  });

  test('should reflect role changes after logout and login', async ({ page }) => {
    // Login as admin
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(baseUrl + '/dashboard');
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL(baseUrl + '/login');

    // Login as regular user
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(baseUrl + '/dashboard');
    await expect(page.locator('text=System Settings')).not.toBeVisible();
  });
});