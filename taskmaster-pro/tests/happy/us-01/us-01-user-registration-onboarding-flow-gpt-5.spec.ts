import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): "Register" link is present on the login view and navigates to /register with "Create Your Account" heading.
 * - [PASS] AC_02 (Validation): Mismatched passwords display "Passwords do not match" and remain on /register.
 * - [PASS] AC_03 (Success): Successful registration redirects back to the login page.
 * - [PASS] AC_04 (Persistence): Newly registered credentials can immediately authenticate into the dashboard.
 */

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form via "Register" link on login [AC_01]', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should block registration and show validation when passwords do not match [AC_02]', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Full Name' }).fill('QA Auto User');
    await page.getByRole('textbox', { name: 'Email' }).fill(`qa.auto+ac02.${Date.now()}@example.com`);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Mismatch123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should register successfully and then login to dashboard [AC_03][AC_04]', async ({ page }) => {
    const unique = Date.now();
    const fullName = 'QA Auto User';
    const email = `qa.auto+${unique}@example.com`;
    const password = 'Password123!';

    // Go to Register
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Fill registration with matching passwords
    await page.getByRole('textbox', { name: 'Full Name' }).fill(fullName);
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // AC_03: Redirect back to login after success
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // AC_04: Immediately login with new credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});