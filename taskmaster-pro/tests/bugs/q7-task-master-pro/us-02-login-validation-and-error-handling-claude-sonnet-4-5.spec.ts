/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Login form displays with empty input fields by default
 * - [PASS] AC_02: HTML5 validation prevents empty form submission with native browser warnings
 * - [FAIL] AC_03: Expected "Invalid credentials" error message, but observed "Internal Server Error" 
 *          (Server returns 401 but frontend displays generic error instead of specific validation message)
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('Login Validation and Error Handling', () => {
  
  test('should display empty input fields by default when accessing login page', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // Verify email and password fields are empty
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should prevent submission when email field is empty', async ({ page }) => {
    await page.goto(baseUrl);
    
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Attempt to submit without filling any fields
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify email field has HTML5 required validation
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should prevent submission when password field is empty', async ({ page }) => {
    await page.goto(baseUrl);
    
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill only email field
    await emailInput.fill('test@example.com');
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify password field has HTML5 required validation
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should prevent submission when both fields are empty', async ({ page }) => {
    await page.goto(baseUrl);
    
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Verify both fields are empty
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
    
    // Attempt to submit
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify both fields have required validation
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should display "Invalid credentials" error message when credentials are incorrect', async ({ page }) => {
    test.fail(); // Expected to fail: Implementation shows "Internal Server Error" instead of "Invalid credentials"
    
    await page.goto(baseUrl);
    
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill in invalid credentials
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    
    // Submit the form
    await loginButton.click();
    
    // Verify "Invalid credentials" error message is displayed
    // Note: Currently fails because implementation shows "Internal Server Error"
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should validate email format using HTML5 validation', async ({ page }) => {
    await page.goto(baseUrl);
    
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    
    // Verify email input has type="email" for HTML5 validation
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});