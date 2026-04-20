import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('Login Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('AC_01: Initial State - Login form should have empty input fields by default', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
  });

  test('AC_02: Empty Submission - Should block form submission and show validation warnings', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    await loginButton.click();

    // Verify email validation
    const emailValidationMessage = page.getByText('Email is required');
    await expect(emailValidationMessage).toBeVisible();

    // Verify password validation
    const passwordValidationMessage = page.getByText('Password is required');
    await expect(passwordValidationMessage).toBeVisible();
  });

  test('AC_03: Invalid Credentials - Should show "Invalid credentials" error message', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    // Use intentionally incorrect credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await loginButton.click();

    // Verify invalid credentials message
    const invalidCredentialsMessage = page.getByText('Invalid credentials');
    await expect(invalidCredentialsMessage).toBeVisible();
  });
});