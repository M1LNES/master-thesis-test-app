import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: The registration form is accessible via the "Register" link on the default login view.
 * - [PASS] AC_02: The system prevents registration if the 'Password' and 'Confirm Password' fields do not match, displaying an appropriate validation warning.
 * - [PASS] AC_03: Providing valid details with matching passwords successfully creates the account and automatically redirects the user back to the login page.
 * - [PASS] AC_04: The newly registered credentials are immediately valid for authenticating into the dashboard.
 */

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form via "Register" link', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(baseUrl + '/register');
  });

  test('should display validation warning if passwords do not match', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill('testuser@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password321');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should create account and redirect to login on successful registration', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill('testuser@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL(baseUrl + '/login');
  });

  test('should allow login with newly registered credentials', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('testuser@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(baseUrl + '/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });
});