import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): The registration form is reachable from the login view via the "Register" link.
 * - [PASS] AC_02 (Validation): The form displays "Passwords do not match" when Password and Confirm Password differ.
 * - [PASS] AC_03 (Success): Submitting valid matching details creates the account and redirects back to the login page.
 * - [PASS] AC_04 (Persistence): Newly registered credentials can be used immediately to authenticate to the dashboard.
 */

test.describe('US-01 User Registration & Onboarding Flow', () => {
  test('should open registration form when clicking the Register link from the login view (AC_01)', async ({ page }) => {
    await page.goto(baseUrl); // app handles unauthenticated routing; login is default
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await page.waitForURL('**/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should display validation warning when passwords do not match (AC_02)', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    // Fill form with mismatched passwords
    await page.getByLabel('Full Name').fill('Mismatch User');
    const uniqueEmail = `mismatch+${Date.now()}@example.com`;
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('DifferentPassword!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Expect validation message and to remain on register page
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('should create account and redirect to login when registration succeeds (AC_03)', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    // Use a unique email per test run
    const uniqueEmail = `newuser+${Date.now()}@example.com`;
    await page.getByLabel('Full Name').fill('New User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect back to login
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should allow login with newly registered credentials and reach dashboard (AC_04)', async ({ page }) => {
    // Register a new user, then immediately log in with those credentials
    const uniqueEmail = `persist+${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill('Persistent User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Confirm redirect to login
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Login with the newly created credentials
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify arrival to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    // Also assert a primary dashboard control exists (Logout button observed)
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});