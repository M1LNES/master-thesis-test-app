/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Admin Access): The 'System Settings' navigation tab is correctly rendered for an admin user.
 * - [FAIL] AC_02 (User Restriction): The 'System Settings' tab is unexpectedly rendered in the DOM for a standard user, which contradicts the acceptance criteria. The test for this is marked with test.fail().
 * - [FAIL] AC_03 (Session Boundary): The session boundary test fails because the user restriction (AC_02) is not implemented correctly. The 'System Settings' tab remains visible after logging out as an admin and logging in as a standard user. The test for this is marked with test.fail().
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=a9u3kd1x';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

async function login(page: any, email: string) {
  await page.goto(baseUrl);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
}

async function logout(page: any) {
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
}


test.describe('[US-03] Role-Based Navigation Visibility', () => {

  test('[AC_01] should render System Settings tab for admin users', async ({ page }) => {
    await login(page, adminEmail);

    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toBeVisible();
  });

  test.fail('[AC_02] should not render System Settings tab for standard users', async ({ page }) => {
    await login(page, userEmail);

    // This test is expected to fail.
    // The 'System Settings' link should be absent from the DOM for standard users.
    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).not.toBeAttached();
  });

  test.fail('[AC_03] should reflect correct navigation after session change', async ({ page }) => {
    // 1. Login as Admin and verify the link is visible
    await login(page, adminEmail);
    const adminSystemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(adminSystemSettingsLink).toBeVisible();
    await logout(page);

    // 2. Login as Standard User and verify the link is NOT attached
    await login(page, userEmail);
    
    // This test is expected to fail at this assertion.
    // The link should be gone, but it is still present.
    const userSystemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(userSystemSettingsLink).not.toBeAttached();
  });

});