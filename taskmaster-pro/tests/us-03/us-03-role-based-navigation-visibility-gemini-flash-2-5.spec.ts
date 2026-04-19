import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';
const systemSettingsLinkText = 'System Settings';

test.describe('Role-Based Navigation Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl + '/login');
  });

  async function login(page, email, password) {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  }

  async function logout(page) {
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
  }

  test('AC_01: should render "System Settings" navigation tab for administrator', async ({ page }) => {
    await login(page, adminEmail, password);
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();
  });

  test('AC_02: should strictly omit "System Settings" tab from DOM for standard user', async ({ page }) => {
    await login(page, userEmail, password);
    await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeHidden();
  });

  test('AC_03: should correctly isolate sessions and reflect navigation permissions upon role change', async ({ page }) => {
    // Login as Admin - Verify System Settings is visible
    await test.step('Admin login and verify System Settings visibility', async () => {
      await login(page, adminEmail, password);
      await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();
    });

    // Logout and Login as User - Verify System Settings is NOT visible
    await test.step('Logout as Admin, login as User and verify System Settings absence', async () => {
      await logout(page);
      await login(page, userEmail, password);
      await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeHidden();
    });

    // Logout and Login as Admin again - Verify System Settings is visible again
    await test.step('Logout as User, login as Admin again and verify System Settings visibility', async () => {
      await logout(page);
      await login(page, adminEmail, password);
      await expect(page.getByRole('link', { name: systemSettingsLinkText })).toBeVisible();
    });
  });
});