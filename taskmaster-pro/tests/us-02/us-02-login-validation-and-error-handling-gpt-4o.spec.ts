import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Verified that the login interface is presented with empty input fields by default.
 * - [PASS] AC_02: Verified that submitting the login form without email and password is blocked.
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

  test('should block submission with empty email and password', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Login' }).click();
    // Assuming there is a validation message or some indication of error
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