/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State) — Navigating to the base URL redirected to /login and both Email and Password inputs are empty by default.
 * - [PASS] AC_02 (Empty Submission) — The form uses native constraint validation: inputs have `required` attributes, form.checkValidity() === false after attempting submit, and focus moves to the first invalid input (Email). There is no custom role="alert" element displayed for empty submit.
 * - [PASS] AC_03 (Invalid Credentials) — Submitting incorrect credentials shows a visible "Invalid credentials" message and the page stays on /login.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Validation and Error Handling (US-02)', () => {
  test('should show login form with empty inputs by default (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    // Inputs should be present and empty
    const emailValue = await page.getByLabel('Email').inputValue();
    const passwordValue = await page.getByLabel('Password').inputValue();

    expect(emailValue).toBe('', 'Expected Email input to be empty by default');
    expect(passwordValue).toBe('', 'Expected Password input to be empty by default');

    // Basic UI verifications seen during exploration
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should prevent submitting empty form and rely on local constraint validation (AC_02)', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    // Verify inputs declare required (observed in the app)
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    const emailHasRequired = await email.evaluate((el: HTMLInputElement) => el.hasAttribute('required'));
    const passwordHasRequired = await password.evaluate((el: HTMLInputElement) => el.hasAttribute('required'));
    expect(emailHasRequired).toBe(true);
    expect(passwordHasRequired).toBe(true);

    // Attempt to submit the empty form
    await loginButton.click();

    // The app uses native constraint validation: form.checkValidity() should be false, preventing submission.
    const formIsValid = await email.evaluate((el: HTMLInputElement) => {
      const form = el.form;
      return form ? form.checkValidity() : true; // if no form, treat as valid to fail test later
    });
    expect(formIsValid).toBe(false);

    // Native validation typically focuses the first invalid input — ensure Email is focused
    await expect(email).toBeFocused();

    // Note: The application does not render a visible role="alert" for this case (native browser UI is used),
    // so we assert on programmatic indicators (required attributes, checkValidity, focus) rather than a custom alert element.
  });

  test('should display "Invalid credentials" when email or password is incorrect (AC_03)', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    // Fill with incorrect credentials observed during exploration
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('badpassword');

    // Submit
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for the expected error message to appear
    const invalidMessage = page.getByText('Invalid credentials', { exact: false });
    await expect(invalidMessage).toBeVisible();

    // Ensure we are still on the login page (no redirect on failed login)
    await expect(page).toHaveURL(/\/login$/);
  });
});