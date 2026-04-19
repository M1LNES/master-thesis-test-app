import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Registration link exists on login page and navigates to registration form
 * - [PASS] AC_02: Registration form has password and confirm password fields
 * - [PASS] AC_03: Registration form is present with all required fields
 * - [VERIFY] AC_04: Need to test login persistence after registration
 */

test.describe('User Registration Flow', () => {
  test('should navigate to registration page from login page', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    
    // Click on Register link
    await page.getByRole('link', { name: 'Register' }).click();
    
    // Verify registration page is loaded
    await expect(page).toHaveURL(`${baseUrl}/register`);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should prevent registration when passwords do not match', async ({ page }) => {
    // Navigate to registration page
    await page.goto(`${baseUrl}/register`);
    
    // Fill out registration form with mismatched passwords
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('testuser@example.com');
    await page.getByLabel('Password').fill('ValidPassword123');
    await page.getByLabel('Confirm Password').fill('DifferentPassword456');
    
    // Attempt to submit the form
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Verify error message or form submission is prevented
    // Note: The exact validation mechanism depends on the application's implementation
    await expect(page).toHaveURL(`${baseUrl}/register`);
  });

  test('should successfully register a new user', async ({ page }) => {
    // Navigate to registration page
    await page.goto(`${baseUrl}/register`);
    
    // Generate unique test user details
    const testUser = {
      fullName: 'John Doe',
      email: `john.doe+${Date.now()}@example.com`,
      password: 'StrongPassword123!'
    };
    
    // Fill out registration form
    await page.getByLabel('Full Name').fill(testUser.fullName);
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);
    
    // Submit registration
    await page.getByRole('button', { name: 'Register' }).click();
    
    // Verify redirection to login page
    await page.waitForURL(`${baseUrl}/login`);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    
    // Attempt to log in with newly created credentials
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login (redirects to dashboard)
    await page.waitForURL(`${baseUrl}/dashboard`);
    // Add a dashboard-specific assertion if possible
  });
});