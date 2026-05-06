import { test, expect, Page } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

/**
 * Helper function to perform login.
 */
async function login(page: Page, email: string) {
  await page.goto(baseUrl + '/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
}

/**
 * Helper function to perform logout.
 */
async function logout(page: Page) {
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
}

test.describe('[US-03] Role-Based Navigation Visibility', () => {

  test('AC_01: should display System Settings tab for admin users', async ({ page }) => {
    await login(page, adminEmail);
    
    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toBeVisible();
  });

  test('AC_02: should not render System Settings tab for standard users', async ({ page }) => {
    await login(page, userEmail);

    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).not.toBeAttached();
  });
  
  test('AC_03: should correctly reflect navigation after session changes', async ({ page }) => {
    // 1. Login as admin and verify admin link is visible
    await login(page, adminEmail);
    const adminSystemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(adminSystemSettingsLink).toBeVisible();

    // 2. Logout
    await logout(page);

    // 3. Login as standard user and verify admin link is absent
    await login(page, userEmail);
    const userSystemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(userSystemSettingsLink).not.toBeAttached();
    
    // 4. Logout
    await logout(page);

    // 5. Login as admin again and verify admin link is visible again
    await login(page, adminEmail);
    await expect(adminSystemSettingsLink).toBeVisible();
  });
});