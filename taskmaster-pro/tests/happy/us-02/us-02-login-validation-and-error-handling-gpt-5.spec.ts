/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Login page loads at /login with Email and Password inputs empty by default.
 * - [FAIL] AC_02: Expected local validation warnings on empty submission, but clicking "Login" with empty fields did not display warnings (Email field simply received focus). Test marked as expected to fail.
 * - [PASS] AC_03: Submitting invalid credentials shows a visible "Invalid credentials" message.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should present login interface with empty fields on first load [AC_01]', async ({ page }) => {
    await page.goto(baseUrl);

    // Verify we are on the login page and the login form is visible
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // Inputs should be visible and empty by default
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should block empty submission with local validation warnings [AC_02]', async ({ page }) => {
    test.fail(true, 'Empty submission did not show local validation warnings in the live app.');

    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    // Ensure fields are empty
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');

    // Attempt to submit without filling any fields
    await page.getByRole('button', { name: 'Login' }).click();

    // EXPECTED: Local validation warnings should be visible and inputs marked invalid.
    // Using robust assertions that don't assume exact warning text, but check invalid state.
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should display "Invalid credentials" error when credentials are incorrect [AC_03]', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});