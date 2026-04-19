/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: On visiting the login page unauthenticated, the login form is shown and both "Email" and "Password" fields are empty by default.
 * - [FAIL] AC_02: Submitting the login form with both fields empty does NOT show any local validation warning; the form simply stays on the page. (No visible validation message found.)
 * - [PASS] AC_03: Submitting the form with invalid credentials shows a visible "Invalid credentials" error message.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Validation and Error Handling', () => {
  test('should show empty email and password fields on initial load', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    const email = await page.getByLabel('Email').inputValue();
    const password = await page.getByLabel('Password').inputValue();
    expect(email).toBe('');
    expect(password).toBe('');
  });

  test.fail(true, 'No local validation warning is shown for empty submission (AC_02 implementation missing)');
  test('should block submission and show validation warnings when both fields are empty', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect a local validation warning (e.g., "Email is required" or "Password is required")
    // No such message is present in the DOM after submission, so this will fail until implemented.
    await expect(
      page.getByText(/required|please enter|must provide/i, { exact: false })
    ).toBeVisible();
  });

  test('should show "Invalid credentials" error when credentials are incorrect', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('invalid@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});