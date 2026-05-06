/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Input fields are empty by default
 * - [PASS] AC_02: Form submission blocked when fields are empty
 * - [PASS] AC_03: Invalid credentials trigger an error response
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('Login Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('should have empty input fields by default', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });

    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should prevent form submission with empty fields', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    await loginButton.click();

    // Verify the page remains on the login page
    await expect(page).toHaveURL(/\/login/);
    
    // Optional: Check for validation messages if they exist
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toBeFocused();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });

    // Fill invalid credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await loginButton.click();

    // Check for error notification or message
    const errorMessage = page.getByText(/Invalid credentials|Authentication failed/i);
    await expect(errorMessage).toBeVisible();

    // Verify still on login page
    await expect(page).toHaveURL(/\/login/);
  });
});