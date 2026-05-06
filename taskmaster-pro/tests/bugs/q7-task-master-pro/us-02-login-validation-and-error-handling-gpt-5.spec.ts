/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Unauthenticated access redirects to /login with "Email" and "Password" fields empty by default.
 * - [PASS] AC_02: Submitting empty form keeps user on /login and focuses the first invalid field; inputs are HTML5 required (blocked by native validation). No inline textual warnings observed.
 * - [FAIL] AC_03: Submitting wrong credentials shows "Internal Server Error" instead of the expected "Invalid credentials" message.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should show login interface with empty inputs on initial unauthenticated access', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page).toHaveURL(/\/login$/);

    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginBtn = page.getByRole('button', { name: 'Login' });

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(loginBtn).toBeVisible();

    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');
  });

  test('should prevent submission and focus first invalid field when submitting empty form', async ({ page }) => {
    await page.goto(baseUrl);

    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginBtn = page.getByRole('button', { name: 'Login' });

    // Ensure fields start empty
    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');

    // Submit empty form
    await loginBtn.click();

    // Remains on login and focuses first invalid field (native HTML5 validation)
    await expect(page).toHaveURL(/\/login$/);
    await expect(email).toBeFocused();

    // Constraint validation should report missing values
    const emailMissing = await email.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    const passwordMissing = await password.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(emailMissing).toBe(true);
    expect(passwordMissing).toBe(true);
  });

  test('should display "Invalid credentials" message when credentials are incorrect', async ({ page }) => {
    test.fail(true, 'Observed "Internal Server Error" page instead of an "Invalid credentials" inline error.');

    await page.goto(baseUrl);

    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginBtn = page.getByRole('button', { name: 'Login' });

    await email.fill('foo@bar.com');
    await password.fill('wrongpass');
    await loginBtn.click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});