/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): The registration form is accessible via the "Register" link on the login view.
 * - [PASS] AC_02 (Validation): The system prevents registration if the 'Password' and 'Confirm Password' fields do not match, displaying a validation warning.
 * - [PASS] AC_03 (Success): Providing valid details with matching passwords successfully creates the account and redirects the user back to the login page.
 * - [PASS] AC_04 (Persistence): The newly registered credentials are immediately valid for authenticating into the dashboard.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form from login page', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  });

  test('should display validation error when passwords do not match', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should register new user and redirect to login page', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.waitForURL(baseUrl + '/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should allow login with newly registered credentials', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL(baseUrl + '/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});