/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: The login form is presented with empty email and password fields upon initial load.
 * - [PASS] AC_02: The application correctly uses the 'required' attribute on input fields, triggering browser-native validation when the form is submitted with empty fields.
 * - [FAIL] AC_03: When submitting with incorrect credentials, the application displays "Internal Server Error" instead of the expected "Invalid credentials" message. The test asserts the correct expected behavior but is marked with `test.fail()` due to this apparent bug.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('US-02: Login Validation and Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  // AC_01 (Initial State)
  test('should display an empty login form on initial load', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeEmpty();
    await expect(page.getByLabel('Password')).toBeEmpty();
  });

  // AC_02 (Empty Submission)
  test('should block submission and show validation warnings for empty fields', async ({ page }) => {
    // Checking for the 'required' attribute is a robust way to verify local validation
    // without depending on the appearance of specific, hard-to-capture browser pop-ups.
    await expect(page.getByLabel('Email')).toHaveAttribute('required');
    await expect(page.getByLabel('Password')).toHaveAttribute('required');

    // As an additional check, we click the login button and ensure we haven't navigated away.
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  // AC_03 (Invalid Credentials)
  test('should display "Invalid credentials" for incorrect login attempt', async ({ page }) => {
    // This test is expected to fail because the application currently shows
    // "Internal Server Error" instead of "Invalid credentials".
    test.fail();

    await page.getByLabel('Email').fill('invalid@user.com');
    await page.getByLabel('Password').fill('invalidpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();
  });
});