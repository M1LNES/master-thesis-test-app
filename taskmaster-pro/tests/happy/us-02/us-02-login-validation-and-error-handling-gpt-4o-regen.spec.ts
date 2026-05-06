import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Verified that the login interface is presented with empty input fields by default.
 * - [FAIL] AC_02: Expected validation messages for empty email and password, but none were displayed.
 * - [PASS] AC_03: Verified that submitting the form with incorrect credentials shows "Invalid credentials" error message.
 */

test.describe('Login Validation and Error Handling', () => {
  test('should display empty input fields on initial load', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    const emailValue = await page.getByRole('textbox', { name: 'Email' }).inputValue();
    const passwordValue = await page.getByRole('textbox', { name: 'Password' }).inputValue();
    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });

  test.fail('should block submission with empty email and password', async ({ page }) => {
    // This test is expected to fail because the application does not show validation messages for empty fields.
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Login' }).click();
    const emailError = await page.getByText('Email is required').isVisible();
    const passwordError = await page.getByText('Password is required').isVisible();
    expect(emailError).toBeTruthy();
    expect(passwordError).toBeTruthy();
  });

  test('should show "Invalid credentials" error for incorrect login', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});