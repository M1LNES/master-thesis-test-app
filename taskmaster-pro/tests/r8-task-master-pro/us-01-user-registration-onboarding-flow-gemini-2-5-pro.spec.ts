import { test, expect } from '@playwright/test';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): The "Register" link correctly navigates from the login view to the registration form.
 * - [FAIL] AC_02 (Validation): The system does not display a validation warning when 'Password' and 'Confirm Password' fields do not match. Instead, it redirects to the login page without any feedback. The test for this is marked with test.fail() as it asserts the expected (but currently missing) behavior.
 * - [PASS] AC_03 (Success): Successful registration with valid details correctly redirects the user to the login page.
 * - [PASS] AC_04 (Persistence): A newly registered user can immediately log in and access the dashboard.
 */

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('US-01: User Registration & Onboarding Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('should navigate to the registration page from the login page', async ({ page }) => {
    // AC_01 (Navigation)
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should show a validation warning if passwords do not match', async ({ page }) => {
    // AC_02 (Validation)
    test.fail(true, 'Expected validation message for mismatched passwords is not implemented.');
    
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(`test-fail-${Date.now()}@example.com`);
    await page.getByLabel('Password').first().fill('password123');
    await page.getByLabel('Confirm Password').fill('password456');
    await page.getByRole('button', { name: 'Register' }).click();

    // The application should display an error message, but it currently redirects.
    // The following assertion is what we expect to see.
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should register a new user and allow them to log in', async ({ page }) => {
    const uniqueEmail = `test-user-${Date.now()}@example.com`;
    const password = 'a-secure-password-123';

    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    
    // Fill out registration form with valid data
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').first().fill(password);
    await page.getByLabel('Confirm Password').fill(password);

    // AC_03 (Success): Submit form and verify redirection to login
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // AC_04 (Persistence): Log in with new credentials
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify successful login by checking for dashboard content
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});