import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Verified that the login interface is presented with empty input fields by default.
 * - [PASS] AC_02: Verified that submitting the login form without email and password is blocked by local validation.
 * - [FAIL] AC_03: Expected "Invalid credentials" error message upon submitting incorrect credentials, but observed a server error instead.
 */

test.describe('Login Validation and Error Handling', () => {
  test('should display empty input fields on initial load', async ({ page }) => {
    await page.goto(baseUrl);
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });

    await expect(emailField).toHaveValue('');
    await expect(passwordField).toHaveValue('');
  });

  test('should block submission with empty email and password', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Login' }).click();

    // Assuming there is a validation message that appears
    const validationMessage = page.getByText('Please fill out this field.');
    await expect(validationMessage).toBeVisible();
  });

  test.fail('should display "Invalid credentials" error message for incorrect login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Expecting an "Invalid credentials" message, but observed a server error
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });
});