import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=q7m2vn4k';

test.describe('Login Feature', () => {
  test('should have empty login fields by default', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await expect(page.getByLabel('Email')).toBeEmpty();
    await expect(page.getByLabel('Password')).toBeEmpty();
  });

  test('should display validation warnings when submitting empty login form', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should display "Invalid credentials" error when logging in with incorrect details', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});