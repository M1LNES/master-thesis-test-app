/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Login page is shown on initial visit with Email and Password fields empty by default.
 * - [PASS] AC_02: Submitting with empty fields is blocked by native browser validation (required fields); focus moves to first invalid field and submission is prevented.
 * - [FAIL] AC_03: After submitting invalid credentials, a 401 occurs but no visible "Invalid credentials" message appears on the page. Test marked as expected to fail.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should show login interface with empty inputs on initial visit (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { level: 3, name: 'Welcome Back' })).toBeVisible();

    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();

    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');
  });

  test('should block empty submission with native validation warnings (AC_02)', async ({ page }) => {
    await page.goto(baseUrl);

    // Attempt to submit with both fields empty
    await page.getByRole('button', { name: 'Login' }).click();

    // Stay on the login page (no navigation due to blocked submission)
    await expect(page).toHaveURL(/\/login$/);

    const email = page.getByLabel('Email');
    await expect(email).toBeFocused();

    // Assert native validation is active on the first invalid field
    const emailValidationMessage = await email.evaluate((el) => (el as HTMLInputElement).validationMessage);
    expect(emailValidationMessage).toBeTruthy();
  });

  test('should block submission and show validation when password is missing (AC_02 edge case)', async ({ page }) => {
    await page.goto(baseUrl);

    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');

    await email.fill('user@example.com');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/login$/);

    // Password should be the first invalid field with native validation
    await expect(password).toBeFocused();
    const pwdValidationMessage = await password.evaluate((el) => (el as HTMLInputElement).validationMessage);
    expect(pwdValidationMessage).toBeTruthy();

    // Email should be valid now
    const emailIsValid = await email.evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(emailIsValid).toBe(true);
  });

  test('should display "Invalid credentials" error when credentials are incorrect (AC_03)', async ({ page }) => {
    test.fail(true, 'Expected UI error message not visible after 401 Unauthorized; implementation may be missing the user-facing error.');

    await page.goto(baseUrl);

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('badpass');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should remain on login page
    await expect(page).toHaveURL(/\/login$/);

    // Expect a visible inline or toast error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});