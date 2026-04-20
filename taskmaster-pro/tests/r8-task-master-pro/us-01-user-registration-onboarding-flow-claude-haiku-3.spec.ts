import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('User Registration & Onboarding Flow', () => {
  test('should navigate to registration form from login page', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
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
    await page.waitForURL(baseUrl);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should allow login with newly registered credentials', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});