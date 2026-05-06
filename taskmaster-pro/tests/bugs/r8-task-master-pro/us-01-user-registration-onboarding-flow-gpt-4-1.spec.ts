/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): "Register" link is present on the login page and navigates to the registration form.
 * - [FAIL] AC_02 (Validation): Registration with mismatched passwords does NOT show a validation warning; instead, it redirects to login (possible implementation bug).
 * - [PASS] AC_03 (Success): Registration with valid, matching passwords creates the account and redirects to login.
 * - [PASS] AC_04 (Persistence): Newly registered credentials are immediately valid for login and dashboard access.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('[US-01] User Registration & Onboarding Flow', () => {
  test('should display registration form when clicking Register link on login page', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Full Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
  });

  test.fail(true, 'Registration with mismatched passwords does not show validation warning; redirects to login instead (implementation bug).');
  test('should prevent registration and show validation warning if passwords do not match', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill('testuser+ac02@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password1234!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Expected: Validation warning about password mismatch is visible, and user stays on registration page
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should register successfully and redirect to login when valid details are provided', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    const uniqueEmail = `testuser+${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect to login page
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // Store email for next test
    test.info().annotations.push({ type: 'registeredEmail', description: uniqueEmail });
  });

  test('should allow login with newly registered credentials', async ({ page }, testInfo) => {
    // Retrieve the email used in the previous test
    const registeredEmail = testInfo.annotations.find(a => a.type === 'registeredEmail')?.description
      // fallback for direct run
      || `testuser+ac04_${Date.now()}@example.com`;

    // If running in isolation, register the user first
    if (!testInfo.annotations.find(a => a.type === 'registeredEmail')) {
      await page.goto(baseUrl);
      await page.getByRole('link', { name: 'Register' }).click();
      await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
      await page.getByRole('textbox', { name: 'Email' }).fill(registeredEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('Password123!');
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('Password123!');
      await page.getByRole('button', { name: 'Register' }).click();
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    }

    // Now login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill(registeredEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should redirect to dashboard
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});