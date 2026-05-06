/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State): Upon accessing the application unauthenticated, the user is presented with the login interface where input fields must be empty by default.
 * - [PASS] AC_02 (Empty Submission): Attempting to submit the login form without providing both an email and a password is blocked by local validation warnings.
 * - [FAIL] AC_03 (Invalid Credentials): Submitting the form with an incorrect email or password does not trigger a clearly visible "Invalid credentials" error message on the page, although a 401 Unauthorized error is observed in the console. The UI does not provide feedback to the user.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('[US-02] Login Validation and Error Handling', () => {

  test('should present empty input fields by default on login interface (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);

    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
  });

  test('should display local validation warnings on empty form submission (AC_02)', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Login' }).click();

    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });

    await expect(emailInput).toHaveJSProperty('validationMessage', 'Please fill in this field.');
    await expect(passwordInput).toHaveJSProperty('validationMessage', 'Please fill in this field.');
  });

  test('should display "Invalid credentials" error message for incorrect login (AC_03)', async ({ page }) => {
    test.fail(); // Implementation does not show a visible error message.

    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Expect an error message to be visible on the page.
    // Based on manual observation, no such message appears.
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});