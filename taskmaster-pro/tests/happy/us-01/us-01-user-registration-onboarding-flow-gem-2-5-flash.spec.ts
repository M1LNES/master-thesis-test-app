import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('US-01 User Registration & Onboarding Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('should navigate to the registration form from the login page (AC_01)', async ({ page }) => {
    await expect(page).toHaveURL(`${baseUrl}/login`);
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL(`${baseUrl}/register`);
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should prevent registration if passwords do not match and display a warning (AC_02)', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByLabel('Full Name').fill('Validation Test');
    await page.getByLabel('Email').fill('validation@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('differentpassword');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(`${baseUrl}/register`); // Should remain on the registration page
  });

  test('should successfully register a new user and redirect to login page (AC_03)', async ({ page }) => {
    // Generate a unique email for each test run to avoid conflicts
    const uniqueEmail = `user_${Date.now()}@example.com`;

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByLabel('Full Name').fill('New User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill('securepassword');
    await page.getByLabel('Confirm Password').fill('securepassword');
    await page.getByRole('button', { name: 'Register' }).click();

    await page.waitForURL(`${baseUrl}/login`);
    await expect(page).toHaveURL(`${baseUrl}/login`);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should allow newly registered credentials to log into the dashboard (AC_04)', async ({ page }) => {
    // Register a new user first
    const uniqueEmail = `login_${Date.now()}@example.com`;
    const password = 'dashboardpassword';

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByLabel('Full Name').fill('Dashboard User');
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Ensure redirection to login page after registration
    await page.waitForURL(`${baseUrl}/login`);
    await expect(page).toHaveURL(`${baseUrl}/login`);

    // Attempt to log in with the new credentials
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(`${baseUrl}/dashboard`);
    await expect(page).toHaveURL(`${baseUrl}/dashboard`);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});