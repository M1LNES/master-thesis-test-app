/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Register link is accessible from login page
 * - [FAIL] AC_02: Password mismatch validation - Expected validation warning to be displayed,
 *   but form submits successfully and redirects to login page without showing error message
 * - [PASS] AC_03: Successful registration with matching passwords redirects to login page
 * - [PASS] AC_04: Newly registered credentials are immediately valid for authentication
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('User Registration & Onboarding Flow [US-01]', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    // Application automatically redirects to /login for unauthenticated users
    await page.waitForURL('**/login');
  });

  test('should display registration form when clicking Register link (AC_01)', async ({ page }) => {
    // Verify Register link is visible on login page
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    
    // Click Register link
    await registerLink.click();
    
    // Verify navigation to registration page
    await page.waitForURL('**/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
    
    // Verify all required form fields are present
    await expect(page.getByRole('textbox', { name: 'Full Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('should prevent registration when passwords do not match (AC_02)', async ({ page }) => {
    test.fail(); // Expected to fail - validation not implemented correctly
    
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');
    
    // Fill form with mismatched passwords
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Email' }).fill('mismatch@test.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentpassword');
    
    // Attempt to submit
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Should remain on registration page
    await expect(page).toHaveURL(/.*\/register/);
    
    // Should display validation warning
    await expect(page.getByText(/password.*do not match|passwords must match/i)).toBeVisible();
  });

  test('should successfully register with valid matching passwords and redirect to login (AC_03)', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');
    
    // Generate unique email to avoid conflicts
    const timestamp = Date.now();
    const testEmail = `user${timestamp}@test.com`;
    const testPassword = 'SecurePass123';
    
    // Fill registration form with valid data
    await page.getByRole('textbox', { name: 'Full Name' }).fill('John Doe');
    await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(testPassword);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(testPassword);
    
    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should allow login with newly registered credentials (AC_04)', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');
    
    // Generate unique credentials
    const timestamp = Date.now();
    const testEmail = `newuser${timestamp}@test.com`;
    const testPassword = 'MySecurePass456';
    
    // Register new account
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Jane Smith');
    await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(testPassword);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(testPassword);
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Wait for redirect to login page
    await page.waitForURL('**/login');
    
    // Login with newly created credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(testPassword);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should successfully authenticate and redirect to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Verify user is authenticated (Logout button should be visible)
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('should navigate back to login from registration page', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');
    
    // Click "Go to login" link
    await page.getByRole('link', { name: 'Go to login' }).click();
    
    // Should return to login page
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should handle registration with minimum password length requirement', async ({ page }) => {
    // Navigate to registration page
    await page.getByRole('link', { name: 'Register' }).click();
    await page.waitForURL('**/register');
    
    // Verify password field shows minimum 8 characters requirement
    const passwordField = page.getByRole('textbox', { name: 'Password', exact: true });
    await expect(passwordField).toHaveAttribute('placeholder', 'Minimum 8 characters');
    
    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `minpass${timestamp}@test.com`;
    const validPassword = 'Pass1234'; // Exactly 8 characters
    
    // Fill form with 8-character password
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Min Pass User');
    await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
    await passwordField.fill(validPassword);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(validPassword);
    
    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Should successfully register and redirect to login
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});