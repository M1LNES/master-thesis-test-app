import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

test.describe('User Registration & Onboarding Flow', () => {
  test('AC_01 (Navigation): should be accessible via the "Register" link on the default login view', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL('http://localhost:3000/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('AC_02 (Validation): should prevent registration if passwords do not match', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('differentpassword');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible(); // Assuming this is the validation message
    await expect(page).toHaveURL('http://localhost:3000/register'); // Should remain on the registration page
  });

  test('AC_03 (Success): should successfully create an account and redirect to login on valid details', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'Password123!';

    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill(`Test User ${timestamp}`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByText('Registration successful')).toBeVisible(); // Assuming a success message is displayed
  });

  test('AC_04 (Persistence): newly registered credentials should be immediately valid for login', async ({ page }) => {
    const timestamp = Date.now();
    const email = `persistentuser${timestamp}@example.com`;
    const password = 'PersistentPassword123!';

    // Register a new user
    await page.goto(baseUrl + '/register');
    await page.getByLabel('Full Name').fill(`Persistent User ${timestamp}`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Log in with the new credentials
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard'); // Assuming successful login redirects to /dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible(); // Assuming a Dashboard heading exists
  });
});