/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State) — Navigating to the base URL redirected to /login and both Email and Password inputs are empty by default.
 * - [FAIL] AC_02 (Empty Submission) — Expected local/browser validation warnings when submitting an empty form (e.g., visible validation message or alert). Observed no visible validation UI or alert role; inputs do have `required` attributes but no visible validation message was detected. Marking test as expected-to-fail so it will surface if the implementation is fixed later.
 * - [PASS] AC_03 (Invalid Credentials) — Submitting incorrect credentials triggers a visible "Invalid credentials" message and the page stays on /login (server returned 401 during exploration).
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Validation and Error Handling (US-02)', () => {
  test('should show login form with empty inputs by default (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);
    // Ensure we're on the login page
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

  test('should prevent submitting empty form and show local validation warnings (AC_02) - EXPECTED TO FAIL IF IMPLEMENTATION IS MISSING', async ({ page }) => {
    // This behavior could not be observed reliably during exploration: the inputs do have `required` attributes
    // but no visible validation warning/alert was detected. Marking test as expected-to-fail per guidance.
    test.fail();
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    // Click Login without filling fields
    await page.getByRole('button', { name: 'Login' }).click();

    // Expected correct behavior (what this test asserts):
    // - The form should be blocked by local validation (form.checkValidity() === false).
    // - A visible validation message or an element with role="alert" should appear describing missing fields.
    // We assert both: first the form validity, then presence of an alert or validation message.
    const formIsValid = await page
      .getByLabel('Email')
      .evaluate((el: HTMLInputElement) => {
        // If element isn't inside a form, return false to indicate invalid/misconfigured form.
        const form = el.form;
        return form ? form.checkValidity() : false;
      });

    expect(formIsValid).toBe(false);

    // Expect a visible validation message (application might show a custom alert role)
    const anyAlert = page.getByRole('alert');
    // If app shows an alert, it should be visible; otherwise this will fail (and is the point of test.fail()).
    await expect(anyAlert).toBeVisible();
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
    const invalidMessage = page.getByText('Invalid credentials');
    await expect(invalidMessage).toBeVisible();

    // Ensure we are still on the login page (no redirect on failed login)
    await expect(page).toHaveURL(/\/login$/);
  });
});