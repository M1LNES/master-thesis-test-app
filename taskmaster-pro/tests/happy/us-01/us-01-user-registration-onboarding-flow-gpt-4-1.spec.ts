/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: "Register" link is present on the login view and navigates to the registration form.
 * - [PASS] AC_02: Registration is prevented if 'Password' and 'Confirm Password' do not match, with a visible validation warning.
 * - [PASS] AC_03: Successful registration redirects user back to the login page.
 * - [PASS] AC_04: Newly registered credentials are immediately valid for login and dashboard access.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form via "Register" link on login view (AC_01)', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(baseUrl + '/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should show validation warning if passwords do not match (AC_02)', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill('testuser+fail@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password321');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(baseUrl + '/register');
  });

  test('should register successfully and redirect to login page (AC_03)', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(baseUrl + '/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should allow login with newly registered credentials (AC_04)', async ({ page }) => {
    // Register a new user
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    const password = 'Password123!';
    await page.goto(baseUrl + '/register');
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(baseUrl + '/login');

    // Login with the new credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Should be redirected to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});