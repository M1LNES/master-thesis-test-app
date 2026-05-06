/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: On unauthenticated access, the login interface is shown and both input fields are empty by default.
 * - [FAIL] AC_02: Submitting the login form with empty fields does NOT show local validation warnings; the form simply focuses the first field.
 * - [FAIL] AC_03: Submitting invalid credentials results in an "Internal Server Error" message, not a user-friendly "Invalid credentials" error.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should show login form with empty fields on initial load', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');
  });

  test.fail(true, 'No local validation warnings are shown for empty submission (AC_02 implementation missing)');
  test('should block empty submission and show validation warnings', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect local validation warnings (e.g., "Email is required", "Password is required")
    // None are shown; test will fail until implemented.
    await expect(
      page.getByText(/required|please enter/i, { exact: false })
    ).toBeVisible();
  });

  test.fail(true, 'No user-friendly "Invalid credentials" error, only "Internal Server Error" (AC_03 implementation bug)');
  test('should show "Invalid credentials" error for incorrect login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@email.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect a user-friendly error message
    await expect(page.getByText('Invalid credentials', { exact: false })).toBeVisible();
  });
});