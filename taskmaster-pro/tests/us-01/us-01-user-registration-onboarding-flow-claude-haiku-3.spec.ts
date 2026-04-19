import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form from login page', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
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