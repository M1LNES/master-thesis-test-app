import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('AC_01: should display empty input fields by default on login page', async ({ page }) => {
    // Verify user is on login page
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login form is visible
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // Verify email field is empty
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    
    // Verify password field is empty
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveValue('');
  });

  test('AC_02: should block empty form submission with validation warnings', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Verify fields are required (HTML5 validation)
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
    
    // Attempt to submit with empty fields
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify HTML5 validation is triggered (email field should be focused/invalid)
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBe(true);
  });

  test('AC_02: should block submission when only email is provided', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill only email
    await emailInput.fill('test@example.com');
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify password field validation is triggered
    const isPasswordInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isPasswordInvalid).toBe(true);
  });

  test('AC_02: should block submission when only password is provided', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill only password
    await passwordInput.fill('password123');
    await loginButton.click();
    
    // Verify form was not submitted (still on login page)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify email field validation is triggered
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBe(true);
  });

  test('AC_03: should display error message when invalid credentials are submitted', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill in invalid credentials
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    
    // Submit the form
    await loginButton.click();
    
    // Verify "Invalid credentials" error message is displayed
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('AC_03: should display error message for non-existent user', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill in credentials for non-existent user
    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('anypassword123');
    
    // Submit the form
    await loginButton.click();
    
    // Verify "Invalid credentials" error message is displayed
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('AC_03: should display error message for incorrect password', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });
    
    // Fill in valid email but wrong password
    await emailInput.fill('user@example.com');
    await passwordInput.fill('incorrectpassword');
    
    // Submit the form
    await loginButton.click();
    
    // Verify "Invalid credentials" error message is displayed
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/\/login/);
  });
});