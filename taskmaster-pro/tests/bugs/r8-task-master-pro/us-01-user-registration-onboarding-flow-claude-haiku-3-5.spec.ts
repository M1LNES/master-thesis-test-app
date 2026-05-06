import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('User Registration Flow', () => {
  // AC_01: Verify registration form is accessible via "Register" link
  test('should navigate to registration page from login page', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  // AC_02: Password mismatch validation
  test('should prevent registration when passwords do not match', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);
    
    // Fill out registration form with mismatched passwords
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('test.user@example.com');
    await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('DifferentPassword456!');
    
    // Attempt to register
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Expect a validation error message
    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  // AC_03: Successful registration
  test('should create account with valid matching passwords', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);
    
    // Generate unique test user credentials
    const testUser = {
      fullName: `Test User ${Date.now()}`,
      email: `test.user.${Date.now()}@example.com`,
      password: 'ValidPass123!'
    };
    
    // Fill out registration form
    await page.getByLabel('Full Name').fill(testUser.fullName);
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password', { exact: true }).fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);
    
    // Register
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Verify redirection to login page
    await page.waitForURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  // AC_04: Login with newly created credentials
  test('should successfully login with newly registered credentials', async ({ page }) => {
    // Use the credentials from the previous test
    const testUser = {
      email: `test.user.${Date.now() - 1}@example.com`,
      password: 'ValidPass123!'
    };
    
    await page.goto(baseUrl);
    
    // Login with new credentials
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify dashboard access
    await page.waitForURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });
});