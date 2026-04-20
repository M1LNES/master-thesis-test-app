/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Verified that the login interface is presented with empty input fields by default.
 * - [FAIL] AC_02: No local validation warnings were observed when submitting the form with empty fields.
 * - [FAIL] AC_03: Submitting the form with invalid credentials resulted in an "Internal Server Error" instead of an "Invalid credentials" message.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('Login Validation and Error Handling', () => {
  test('should display empty input fields on initial load', async ({ page }) => {
    await page.goto(baseUrl);
    const emailValue = await page.getByRole('textbox', { name: 'Email' }).inputValue();
    const passwordValue = await page.getByRole('textbox', { name: 'Password' }).inputValue();
    expect(emailValue).toBe('');
    expect(passwordValue).toBe('');
  });

  test.fail('should block submission with empty fields and show validation warnings', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect local validation warnings to appear (not observed)
    await expect(page.locator('text=Please enter your email and password')).toBeVisible();
  });

  test.fail('should show "Invalid credentials" message for incorrect login', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    // Expect "Invalid credentials" message (observed "Internal Server Error")
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});