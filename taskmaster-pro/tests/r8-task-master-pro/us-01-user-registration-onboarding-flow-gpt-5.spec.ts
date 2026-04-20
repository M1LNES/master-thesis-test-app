import { test, expect } from '@playwright/test';

const baseUrl: string = 'http://localhost:3000?b=r8w5gb2n';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: "Register" link is visible on the login view and navigates to the registration form (/register)
 * - [FAIL] AC_02: Expected a validation warning and prevention of registration on password mismatch; observed redirect to /login with no warning (likely missing validation)
 * - [PASS] AC_03: Valid registration redirects back to the login page
 * - [PASS] AC_04: Newly registered credentials can immediately authenticate into the dashboard
 */

test.describe('[US-01] User Registration & Onboarding Flow', () => {
  test('should navigate to registration form when clicking "Register" on login (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForURL('**/login');

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await page.waitForURL('**/register');

    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('should block registration and show validation when passwords do not match (AC_02)', async ({ page }) => {
    // Expected to fail: App currently redirects to /login and shows no warning on mismatch
    test.fail(true, 'Observed behavior: redirects to /login without validation on password mismatch');

    await page.goto(baseUrl);
    await page.waitForURL('**/login');

    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');

    await page.getByLabel('Full Name').fill('Alice Tester');
    await page.getByLabel('Email').fill(`alice.mismatch+${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('Password123!');
    await page.getByLabel('Confirm Password').fill('Password123!!');

    await page.getByRole('button', { name: 'Register' }).click();

    // Expected correct behavior:
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should register successfully, redirect to login, and allow immediate login to dashboard (AC_03, AC_04)', async ({ page }) => {
    const unique = Date.now();
    const email = `e2e.user+${unique}@example.com`;
    const password = 'Password123!';

    // Navigate to registration
    await page.goto(baseUrl);
    await page.waitForURL('**/login');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');

    // Fill and submit registration form
    await page.getByLabel('Full Name').fill('Alice Tester');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Should be redirected back to login (AC_03)
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Login immediately with new credentials (AC_04)
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });
});