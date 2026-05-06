/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Login page loads with empty input fields
 * - [PASS] AC_02: Form submission blocked when fields are empty
 * - [PASS] AC_03: Invalid credentials show error message
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
  });

  test('AC_01: Should display login page with empty input fields', async ({ page }) => {
    // Email input
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toBeEmpty();

    // Password input
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    await expect(passwordInput).toBeEmpty();
  });

  test('AC_02: Should prevent form submission with empty fields', async ({ page }) => {
    // Attempt to submit empty form
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify still on login page
    await expect(page).toHaveURL(/\/login$/);
    
    // Verify email input is focused (indicating validation error)
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toBeFocused();
  });

  test('AC_03: Should show invalid credentials error', async ({ page }) => {
    // Fill invalid credentials
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    
    // Submit login form
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.click();

    // Verify error message
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL(/\/login$/);
  });
});