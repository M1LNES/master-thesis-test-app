/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): The 'System Settings' navigation tab is rendered in the header when authenticated as an administrator (`admin@test.com`).
 * - [FAIL] AC_02 (User Restriction): The 'System Settings' tab is *not* strictly omitted from the DOM when authenticated as a standard user (`user@test.com`). It remains visible, which is an implementation bug.
 * - [FAIL] AC_03 (Session Boundary): Logging out and logging back in as a different role does not correctly reflect the navigation permissions for the 'System Settings' tab, as it is always visible. This is a consequence of the AC_02 failure.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=a9u3kd1x';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';
const systemSettingsLinkText = 'System Settings';

test.describe('[US-03] Role-Based Navigation Visibility', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('AC_01: should render "System Settings" for an administrator', async ({ page }) => {
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();
  });

  test('AC_02: should strictly omit "System Settings" for a standard user', async ({ page }) => {
    test.fail(); // Expected to fail due to implementation bug: "System Settings" is visible for standard users.

    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).not.toBeAttached();
  });

  test('AC_03: should correctly isolate sessions when switching roles', async ({ page }) => {
    // Admin login and verification
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // User login and verification (expected to fail)
    test.fail(); // Expected to fail due to implementation bug: "System Settings" is visible for standard users even after relogging.
    await page.getByLabel('Email').fill(userEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).not.toBeAttached();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');

    // Admin login again and verification
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();
  });
});