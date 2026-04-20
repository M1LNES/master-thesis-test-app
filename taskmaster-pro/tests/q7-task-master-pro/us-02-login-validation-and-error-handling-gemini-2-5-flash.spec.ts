/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State): Input fields are empty by default.
 * - [FAIL] AC_02 (Empty Submission): Local validation warnings for empty fields were not observed after submission. The application does not prevent submission when fields are empty.
 * - [FAIL] AC_03 (Invalid Credentials): Expected "Invalid credentials" error message, but observed "Internal Server Error".
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('Login Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('AC_01 should display empty input fields on initial load', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
  });

  test('AC_02 should show local validation warnings on empty submission', async ({ page }) => {
    test.fail(); // Implementation does not show local validation warnings, instead an "Internal Server Error"
    await page.getByRole('button', { name: 'Login' }).click();

    // These assertions expect local validation messages, which are not currently displayed by the app.
    // The actual behavior is an "Internal Server Error" on submission.
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveJSProperty('validationMessage', 'Please fill out this field.');
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveJSProperty('validationMessage', 'Please fill out this field.');
  });

  test('AC_03 should display "Invalid credentials" error message for incorrect login', async ({ page }) => {
    test.fail(); // Implementation shows "Internal Server Error" instead of "Invalid credentials"
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // The current implementation returns an "Internal Server Error" message instead of a user-friendly "Invalid credentials"
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});