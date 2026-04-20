import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State) — Navigating to the base URL lands on /login and shows the login interface.
 *           The Email and Password inputs are present and are empty by default.
 * - [PASS] AC_02 (Empty Submission) — Submitting the form with both fields empty is blocked by native/local validation.
 *           element.checkValidity() is false and validationMessage is present (e.g. "Please fill in this field.").
 * - [FAIL] AC_03 (Invalid Credentials) — Expected the app to display a visible "Invalid credentials" message when incorrect
 *           credentials are submitted. Observed behavior: an "Internal Server Error" message appears and the network
 *           request to /api/login returned 401 Unauthorized. This appears to be a server-side error/incorrect error handling.
 *           The test for this criterion is written with the EXPECTED behavior but is marked with test.fail() so it will
 *           run and be reported as an expected failure until the implementation is fixed.
 */

test.describe('Login Validation and Error Handling (US-02)', () => {
  test('should display login interface with empty email and password on initial unauthenticated access', async ({ page }) => {
    await page.goto(baseUrl);
    // Ensure the login UI is present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    // Inputs should be empty by default
    await expect(page.getByLabel('Email')).toHaveValue('');
    await expect(page.getByLabel('Password')).toHaveValue('');
    // Login button should be visible
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should block submission and surface local validation when email and/or password are empty', async ({ page }) => {
    await page.goto(baseUrl);

    // Click the Login button with empty fields
    await page.getByRole('button', { name: 'Login' }).click();

    // The browser's native validation should prevent submission:
    // checkValidity() should be false and validationMessage should be present for both inputs.
    const emailValidity = await page.getByLabel('Email').evaluate((el: HTMLInputElement) => {
      return { valid: el.checkValidity(), message: el.validationMessage };
    });

    const passwordValidity = await page.getByLabel('Password').evaluate((el: HTMLInputElement) => {
      return { valid: el.checkValidity(), message: el.validationMessage };
    });

    expect(emailValidity.valid).toBeFalsy();
    expect(typeof emailValidity.message).toBe('string');
    expect(emailValidity.message.length).toBeGreaterThan(0);

    expect(passwordValidity.valid).toBeFalsy();
    expect(typeof passwordValidity.message).toBe('string');
    expect(passwordValidity.message.length).toBeGreaterThan(0);

    // Typically the first invalid field receives focus after submission attempt
    await expect(page.getByLabel('Email')).toBeFocused();
  });

  test('should display "Invalid credentials" when email or password are incorrect', async ({ page }) => {
    // This test expresses the EXPECTED correct behavior.
    // Observed: submitting incorrect credentials results in "Internal Server Error" (server returned 401/Unhandled).
    // Marking as expected failure until backend/error handling is fixed.
    test.fail(true, 'Observed server-side error ("Internal Server Error") instead of an "Invalid credentials" message.');

    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // Expectation per AC_03: a visible "Invalid credentials" error message should appear.
    await expect(page.getByText('Invalid credentials', { exact: false })).toBeVisible();
  });
});