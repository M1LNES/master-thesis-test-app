/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Registration form accessible via "Register" link on login page
 * - [PASS] AC_02: Password mismatch validation displays appropriate warning
 * - [PASS] AC_03: Successful registration redirects to login page
 * - [PASS] AC_04: Newly registered credentials are immediately valid for authentication
 * - [BONUS] Duplicate email registration properly handled with error message
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-01] User Registration & Onboarding Flow', () => {
  
  test.describe('AC_01: Navigation to Registration Form', () => {
    test('should navigate to registration form when clicking Register link from login page', async ({ page }) => {
      await page.goto(baseUrl);
      
      // Verify we're on the login page
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
      
      // Click the Register link
      await page.getByRole('link', { name: 'Register' }).click();
      
      // Verify navigation to registration page
      await expect(page).toHaveURL(/\/register$/);
      await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
      
      // Verify all required form fields are present
      await expect(page.getByRole('textbox', { name: 'Full Name' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Confirm Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    });
  });

  test.describe('AC_02: Password Validation', () => {
    test('should display validation error when passwords do not match', async ({ page }) => {
      await page.goto(baseUrl + '/register');
      
      // Fill in registration form with mismatched passwords
      await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
      await page.getByRole('textbox', { name: 'Email' }).fill('mismatch@example.com');
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('differentPassword456');
      
      // Submit the form
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Verify validation error is displayed
      await expect(page.getByText('Passwords do not match')).toBeVisible();
      
      // Verify user remains on registration page
      await expect(page).toHaveURL(/\/register$/);
    });

    test('should not display validation error when passwords match', async ({ page }) => {
      await page.goto(baseUrl + '/register');
      
      // Fill in registration form with matching passwords
      await page.getByRole('textbox', { name: 'Full Name' }).fill('Test User');
      await page.getByRole('textbox', { name: 'Email' }).fill(`valid${Date.now()}@example.com`);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
      
      // Submit the form
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Wait for navigation away from register page
      await page.waitForURL(/\/login$/);
      
      // Verify no validation error was shown (we successfully navigated away)
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('AC_03: Successful Registration', () => {
    test('should create account and redirect to login page when valid details are provided', async ({ page }) => {
      const uniqueEmail = `newuser${Date.now()}@example.com`;
      
      await page.goto(baseUrl + '/register');
      
      // Fill in valid registration details
      await page.getByRole('textbox', { name: 'Full Name' }).fill('New Test User');
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill('securePassword123');
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill('securePassword123');
      
      // Submit the registration form
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Verify automatic redirect to login page
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
      await expect(page.getByText('Sign in to access TaskMaster Pro.')).toBeVisible();
    });
  });

  test.describe('AC_04: Credential Persistence', () => {
    test('should allow immediate login with newly registered credentials', async ({ page }) => {
      const uniqueEmail = `persistent${Date.now()}@example.com`;
      const password = 'mySecurePassword123';
      
      // Step 1: Register a new account
      await page.goto(baseUrl + '/register');
      
      await page.getByRole('textbox', { name: 'Full Name' }).fill('Persistent User');
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
      
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Wait for redirect to login page
      await expect(page).toHaveURL(/\/login$/);
      
      // Step 2: Immediately log in with the new credentials
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Step 3: Verify successful authentication and redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
      
      // Verify user is authenticated (logout button is present)
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    });
  });

  test.describe('Complete Registration & Login Flow', () => {
    test('should complete full user journey from registration to authenticated dashboard access', async ({ page }) => {
      const uniqueEmail = `fullflow${Date.now()}@example.com`;
      const password = 'CompleteFlow123';
      const fullName = 'Complete Flow User';
      
      // Start at base URL (should redirect to login)
      await page.goto(baseUrl);
      await expect(page).toHaveURL(/\/login$/);
      
      // Navigate to registration
      await page.getByRole('link', { name: 'Register' }).click();
      await expect(page).toHaveURL(/\/register$/);
      
      // Complete registration
      await page.getByRole('textbox', { name: 'Full Name' }).fill(fullName);
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Verify redirect to login
      await expect(page).toHaveURL(/\/login$/);
      
      // Log in with new credentials
      await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
      await page.getByRole('textbox', { name: 'Password' }).fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Verify successful authentication
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
      
      // Verify dashboard features are accessible
      await expect(page.getByRole('button', { name: 'New Task' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
      
      // Test logout functionality
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page).toHaveURL(/\/login$/);
    });
  });

  test.describe('Edge Cases & Error Handling', () => {
    test('should display error when attempting to register with existing email', async ({ page }) => {
      const existingEmail = `duplicate${Date.now()}@example.com`;
      const password = 'password123';
      
      // First registration
      await page.goto(baseUrl + '/register');
      await page.getByRole('textbox', { name: 'Full Name' }).fill('First User');
      await page.getByRole('textbox', { name: 'Email' }).fill(existingEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Wait for successful registration
      await expect(page).toHaveURL(/\/login$/);
      
      // Attempt to register again with the same email
      await page.getByRole('link', { name: 'Register' }).click();
      await page.getByRole('textbox', { name: 'Full Name' }).fill('Second User');
      await page.getByRole('textbox', { name: 'Email' }).fill(existingEmail);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
      await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
      await page.getByRole('button', { name: 'Register' }).click();
      
      // Verify error message is displayed
      await expect(page.getByText('User already exists')).toBeVisible();
      
      // Verify user remains on registration page
      await expect(page).toHaveURL(/\/register$/);
    });

    test('should allow navigation back to login from registration page', async ({ page }) => {
      await page.goto(baseUrl + '/register');
      
      // Verify "Go to login" link is present
      await expect(page.getByRole('link', { name: 'Go to login' })).toBeVisible();
      
      // Click the link
      await page.getByRole('link', { name: 'Go to login' }).click();
      
      // Verify navigation to login page
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    });
  });
});