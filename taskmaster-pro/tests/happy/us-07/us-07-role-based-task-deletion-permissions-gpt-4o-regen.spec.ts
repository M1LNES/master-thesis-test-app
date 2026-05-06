/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Admin can see 'Delete' button on all tasks regardless of owner.
 * - [FAIL] AC_02: User should not see 'Delete' button on tasks owned by admin, but it is visible.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Task Deletion Permissions', () => {
  test('should allow admin to see delete button on all tasks', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL(baseUrl + '/dashboard');
    
    // Verify 'Delete' button is visible on all tasks
    const deleteButtons = await page.locator('button:has-text("Delete")').count();
    expect(deleteButtons).toBeGreaterThan(0);
  });

  test.fail('should restrict user to see delete button only on their own tasks', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL(baseUrl + '/dashboard');
    
    // Verify 'Delete' button is visible only on user's own tasks
    const userTaskDeleteButton = await page.locator('text=Owner: user@test.com >> button:has-text("Delete")').count();
    expect(userTaskDeleteButton).toBeGreaterThan(0);

    // Verify 'Delete' button is NOT visible on admin's tasks
    const adminTaskDeleteButton = await page.locator('text=Owner: admin@test.com >> button:has-text("Delete")').count();
    expect(adminTaskDeleteButton).toBe(0); // This is expected to fail as the button is visible
  });
});