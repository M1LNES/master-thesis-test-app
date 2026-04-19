import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: System Settings link is rendered for admin users
 * - [PASS] AC_02: System Settings link is completely absent from DOM for regular users
 * - [PASS] AC_03: Session isolation works correctly; role changes reflect immediately
 */

test.describe('Role-Based Navigation Visibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(baseUrl);
  });

  test('should display System Settings navigation tab when authenticated as administrator', async ({ page }) => {
    // AC_01: Admin Access
    
    // Login as administrator
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify System Settings link is present and visible
    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toBeVisible();
    
    // Verify the link has correct href
    await expect(systemSettingsLink).toHaveAttribute('href', '/dashboard#system-settings');
    
    // Verify the link is clickable
    await systemSettingsLink.click();
    await expect(systemSettingsLink).toHaveAttribute('class', /active/);
  });

  test('should strictly omit System Settings tab from DOM when authenticated as standard user', async ({ page }) => {
    // AC_02: User Restriction
    
    // Login as standard user
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify System Settings link is NOT in the DOM (count should be 0)
    const systemSettingsLinkCount = await page.locator('a:has-text("System Settings")').count();
    expect(systemSettingsLinkCount).toBe(0);
    
    // Additional verification: ensure it's not just hidden but completely absent
    const systemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(systemSettingsLink).toHaveCount(0);
    
    // Verify user can still access other dashboard features
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('should correctly isolate sessions and reflect role navigation permissions after logout and re-login', async ({ page }) => {
    // AC_03: Session Boundary
    
    // Step 1: Login as admin and verify System Settings is present
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    const adminSystemSettingsLink = page.getByRole('link', { name: 'System Settings' });
    await expect(adminSystemSettingsLink).toBeVisible();
    
    // Step 2: Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
    
    // Step 3: Login as regular user and verify System Settings is absent
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    const userSystemSettingsLinkCount = await page.locator('a:has-text("System Settings")').count();
    expect(userSystemSettingsLinkCount).toBe(0);
    
    // Step 4: Logout again
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('**/login');
    
    // Step 5: Login back as admin and verify System Settings reappears
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    const adminSystemSettingsLinkAgain = page.getByRole('link', { name: 'System Settings' });
    await expect(adminSystemSettingsLinkAgain).toBeVisible();
    
    // Verify it's functional
    await adminSystemSettingsLinkAgain.click();
    await expect(page).toHaveURL(/.*#system-settings/);
  });

  test('should prevent unauthorized access by ensuring System Settings element is not hidden but absent from DOM for regular users', async ({ page }) => {
    // Additional test to explicitly verify AC_02 requirement: 
    // "element is physically absent from the DOM, not merely visually hidden"
    
    // Login as standard user
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Check that no element with "System Settings" text exists, even if hidden
    const allSystemSettingsElements = await page.locator('*:has-text("System Settings")').evaluateAll(
      elements => elements.map(el => ({
        tagName: el.tagName,
        visible: (el as HTMLElement).offsetParent !== null,
        display: window.getComputedStyle(el).display,
        visibility: window.getComputedStyle(el).visibility
      }))
    );
    
    // Filter to only link elements (the navigation tab)
    const systemSettingsLinks = allSystemSettingsElements.filter(el => el.tagName === 'A');
    
    // Verify no System Settings links exist at all
    expect(systemSettingsLinks.length).toBe(0);
  });

  test('should maintain admin privileges throughout the session until logout', async ({ page }) => {
    // Additional test for session persistence
    
    // Login as admin
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Verify System Settings is present
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
    
    // Navigate away and back (simulate page refresh or navigation)
    await page.reload();
    
    // Verify System Settings is still present after reload
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
    
    // Click on System Settings
    await page.getByRole('link', { name: 'System Settings' }).click();
    
    // Navigate back to main dashboard view
    await page.goto(baseUrl + '/dashboard');
    
    // Verify System Settings is still present
    await expect(page.getByRole('link', { name: 'System Settings' })).toBeVisible();
  });

  test('should maintain user restrictions throughout the session until logout', async ({ page }) => {
    // Additional test for session persistence with regular user
    
    // Login as regular user
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Verify System Settings is absent
    expect(await page.locator('a:has-text("System Settings")').count()).toBe(0);
    
    // Navigate away and back (simulate page refresh)
    await page.reload();
    
    // Verify System Settings is still absent after reload
    expect(await page.locator('a:has-text("System Settings")').count()).toBe(0);
    
    // Try to navigate directly to system settings hash (security test)
    await page.goto(baseUrl + '/dashboard#system-settings');
    
    // Verify System Settings link is still not rendered
    expect(await page.locator('a:has-text("System Settings")').count()).toBe(0);
  });
});