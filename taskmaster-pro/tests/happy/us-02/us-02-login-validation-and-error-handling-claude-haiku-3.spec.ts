/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State): Login interface is presented with empty input fields
 * - [PASS] AC_02 (Empty Submission): Local validation blocks form submission without email and password
 * - [PASS] AC_03 (Invalid Credentials): "Invalid credentials" error message is displayed
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Feature', () => {
  test('should display empty login fields on initial access', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await expect(page.getByLabel('Email')).toBeEmpty();
    await expect(page.getByLabel('Password')).toBeEmpty();
  });

  test('should display validation errors when submitting empty login form', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should display "Invalid credentials" error when logging in with incorrect credentials', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});