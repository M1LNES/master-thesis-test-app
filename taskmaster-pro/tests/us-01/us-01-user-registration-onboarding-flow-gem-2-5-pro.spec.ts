import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): The "Register" link correctly navigates to the registration form.
 * - [PASS] AC_02 (Validation): The system correctly displays a "Passwords do not match" warning.
 * - [PASS] AC_03 (Success): Successful registration redirects the user back to the login page.
 * - [PASS] AC_04 (Persistence): Newly created user credentials are valid for immediate login.
 */
test.describe('[US-01] User Registration & Onboarding Flow', () => {
  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const validPassword = 'aSecurePassword123!';

  test('AC_01: should navigate to registration page from login view', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    
    await page.waitForURL('**/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('AC_02: should prevent registration with mismatched passwords', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(`test-fail-${Date.now()}@example.com`);
    await page.getByLabel('Password').first().fill(validPassword);
    await page.getByLabel('Confirm Password').fill('aDifferentPassword');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
    expect(page.url()).not.toContain('/login');
  });

  test('AC_03 & AC_04: should register successfully and log in with new credentials', async ({ page }) => {
    // AC_03: Register a new user
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').first().fill(validPassword);
    await page.getByLabel('Confirm Password').fill(validPassword);
    await page.getByRole('button', { name: 'Register' }).click();

    // Assert redirection to login page after registration
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // AC_04: Log in with the new credentials
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(validPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert successful login by checking for dashboard content
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});