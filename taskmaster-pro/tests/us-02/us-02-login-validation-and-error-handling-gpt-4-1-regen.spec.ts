/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: On visiting the login page unauthenticated, the login form is shown and both "Email" and "Password" fields are empty by default.
 * - [PASS] AC_02: Submitting the login form with both fields empty triggers the browser's native validation ("Please fill in this field") and focuses the first empty field.
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

  test('should block submission and show validation warning when both fields are empty', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Login' }).click();

    // The browser should focus the first invalid field (Email)
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();

    // The browser's native validation message should be present
    // Playwright cannot directly capture the popup, but we can check the validationMessage property
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toMatch(/please fill in this field/i);
  });

  test('should show "Invalid credentials" error when credentials are incorrect', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('invalid@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});