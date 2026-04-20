/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Login interface displays with empty input fields by default
 * - [PASS] AC_02: Form submission is blocked by HTML5 validation when fields are empty
 * - [FAIL] AC_03: Invalid credentials error message NOT displayed - API returns 401 but UI shows no feedback
 *   Expected: "Invalid credentials" error message should be visible
 *   Observed: No error message displayed after failed login attempt
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('Login Validation and Error Handling [US-02]', () => {
  
  test('AC_01: should display login interface with empty input fields by default', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login interface elements are present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Sign in to access TaskMaster Pro.')).toBeVisible();
    
    // Verify email field is empty
    const emailField = page.getByRole('textbox', { name: 'Email' });
    await expect(emailField).toBeVisible();
    await expect(emailField).toHaveValue('');
    
    // Verify password field is empty
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveValue('');
    
    // Verify login button is present
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('AC_02: should block form submission with validation warnings when fields are empty', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForURL(/\/login/);
    
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Ensure fields are empty
    await expect(emailField).toHaveValue('');
    await expect(passwordField).toHaveValue('');
    
    // Attempt to submit with empty fields
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify HTML5 validation is active (email field should be focused and have validation message)
    await expect(emailField).toBeFocused();
    
    // Check validation message
    const validationMessage = await emailField.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    expect(validationMessage.toLowerCase()).toContain('fill');
  });

  test('AC_02: should block form submission when only email is provided', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForURL(/\/login/);
    
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill only email
    await emailField.fill('test@example.com');
    await expect(passwordField).toHaveValue('');
    
    // Attempt to submit
    await loginButton.click();
    
    // Verify form was not submitted
    await expect(page).toHaveURL(/\/login/);
    
    // Verify password field validation is triggered
    const passwordValidationMessage = await passwordField.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(passwordValidationMessage).toBeTruthy();
  });

  test('AC_02: should block form submission when only password is provided', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForURL(/\/login/);
    
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill only password
    await passwordField.fill('password123');
    await expect(emailField).toHaveValue('');
    
    // Attempt to submit
    await loginButton.click();
    
    // Verify form was not submitted
    await expect(page).toHaveURL(/\/login/);
    
    // Verify email field validation is triggered
    await expect(emailField).toBeFocused();
    const emailValidationMessage = await emailField.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(emailValidationMessage).toBeTruthy();
  });

  test('AC_03: should display "Invalid credentials" error message when login fails', async ({ page }) => {
    test.fail(); // Expected to fail - error message not implemented in UI
    
    await page.goto(baseUrl);
    await page.waitForURL(/\/login/);
    
    const emailField = page.getByRole('textbox', { name: 'Email' });
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill in invalid credentials
    await emailField.fill('invalid@test.com');
    await passwordField.fill('wrongpassword');
    
    // Submit the form
    await loginButton.click();
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/login') && response.status() === 401
    );
    
    // Verify error message is displayed
    // Expected behavior: "Invalid credentials" message should be visible
    const errorMessage = page.getByText(/invalid credentials/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('AC_03: should display error message for non-existent user', async ({ page }) => {
    test.fail(); // Expected to fail - error message not implemented in UI
    
    await page.goto(baseUrl);
    await page.waitForURL(/\/login/);
    
    // Fill in credentials for non-existent user
    await page.getByRole('textbox', { name: 'Email' }).fill('nonexistent@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('anypassword123');
    
    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('/api/login')
    );
    
    // Verify error message is displayed
    const errorMessage = page.getByText(/invalid credentials/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/\/login/);
  });
});