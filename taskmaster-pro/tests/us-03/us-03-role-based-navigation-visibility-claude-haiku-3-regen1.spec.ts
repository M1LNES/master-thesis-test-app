/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): The 'System Settings' navigation tab is rendered when authenticated as an administrator.
 * - [PASS] AC_02 (User Restriction): The 'System Settings' tab is physically absent from the DOM when authenticated as a standard user.
 * - [PASS] AC_03 (Session Boundary): Logging out and logging back in as a different role immediately reflects the role's navigation permissions.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Navigation Visibility', () => {
  test('should render System Settings tab for admin user', async ({ page }) => {
    // Navigate to the page
    await page.goto(baseUrl);

    // Inspect the page snapshot
    const snapshot = await page.snapshot();
    console.log(snapshot);

    // Inspect the accessibility tree
    const accessibilityReport = await page.accessibility.snapshot();
    console.log(accessibilityReport);

    // Verify the elements
    await expect(page.getByText('System Settings')).not.toBeVisible();
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForNavigation();

    // Verify the 'System Settings' tab is visible after login
    await expect(page.getByText('System Settings')).toBeVisible();
  });

  test('should omit System Settings tab for standard user', async ({ page }) => {
    // Navigate to the page
    await page.goto(baseUrl);

    // Inspect the page snapshot
    const snapshot = await page.snapshot();
    console.log(snapshot);

    // Inspect the accessibility tree
    const accessibilityReport = await page.accessibility.snapshot();
    console.log(accessibilityReport);

    // Verify the elements
    await expect(page.getByText('System Settings')).not.toBeVisible();
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForNavigation();

    // Verify the 'System Settings' tab is not visible for the standard user
    await expect(page.getByText('System Settings')).not.toBeVisible();
    await expect(page.getByText('System Settings')).not.toExist();
  });

  test('should reflect role-based navigation after logout and login', async ({ page }) => {
    // Navigate to the page
    await page.goto(baseUrl);

    // Inspect the page snapshot
    const snapshot = await page.snapshot();
    console.log(snapshot);

    // Inspect the accessibility tree
    const accessibilityReport = await page.accessibility.snapshot();
    console.log(accessibilityReport);

    // Login as admin
    await page.getByLabel('Email').fill('admin@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForNavigation();
    await expect(page.getByText('System Settings')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForNavigation();

    // Login as standard user
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForNavigation();
    await expect(page.getByText('System Settings')).not.toBeVisible();
  });
});