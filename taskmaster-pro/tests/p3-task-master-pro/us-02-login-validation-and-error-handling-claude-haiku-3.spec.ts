import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('Login Feature', () => {
  test('should display empty login fields by default', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page.getByLabel('Email')).toBeEmpty();
    await expect(page.getByLabel('Password')).toBeEmpty();
  });

  test('should block form submission with empty fields', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should display "Invalid credentials" error with incorrect login', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});