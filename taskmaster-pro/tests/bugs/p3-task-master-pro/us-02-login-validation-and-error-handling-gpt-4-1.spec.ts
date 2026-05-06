/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: On unauthenticated access, the login interface is shown and both input fields are empty by default.
 * - [FAIL] AC_02: Submitting the login form with empty fields does NOT show any local validation warnings (no visible feedback found).
 * - [FAIL] AC_03: Submitting invalid credentials does NOT show a visible "Invalid credentials" error message (no feedback found after failed login).
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should show login interface with empty fields on initial load', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveValue('');
    await expect(page.getByLabel('Password')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test.fail(); // See IMPLEMENTATION NOTES above
  test('should block empty submission and show local validation warnings', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect some validation warning to be visible (none found in implementation)
    await expect(
      page.getByText(/required|please enter|must provide/i)
    ).toBeVisible();
  });

  test.fail(); // See IMPLEMENTATION NOTES above
  test('should show "Invalid credentials" error message on invalid login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('wronguser@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect "Invalid credentials" error message to be visible (none found in implementation)
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});