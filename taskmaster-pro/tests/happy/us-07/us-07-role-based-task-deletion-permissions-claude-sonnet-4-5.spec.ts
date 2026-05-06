/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Admin can see Delete button on all tasks regardless of owner - VERIFIED
 * - [PASS] AC_02: Standard user only sees Delete button on their own tasks - VERIFIED
 * 
 * Note: The application implements AC_02 by filtering the task list entirely for standard users,
 * so they only see their own tasks. This satisfies the requirement that users should not see
 * Delete buttons on tasks owned by others (they don't see those tasks at all).
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Role-Based Task Deletion Permissions', () => {
  
  test.describe('AC_01: Admin Access - Delete button on all tasks', () => {
    
    test('should display Delete button on all tasks when logged in as administrator', async ({ page }) => {
      // Navigate to login page
      await page.goto(baseUrl);
      
      // Login as administrator
      await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dashboard to load
      await page.waitForURL('**/dashboard');
      await expect(page.getByRole('region', { name: 'Task list' })).toBeVisible();
      
      // Verify admin sees multiple tasks with different owners
      await expect(page.getByRole('heading', { name: 'Prepare thesis proposal' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Set up E2E baseline' })).toBeVisible();
      
      // Verify Delete button exists on task owned by admin
      const adminTask1 = page.locator('text="Owner: admin@test.com"').first().locator('..').locator('..');
      await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();
      
      // Verify Delete button exists on task owned by user
      const userTask = page.locator('text="Owner: user@test.com"').locator('..').locator('..');
      await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
      
      // Verify Delete button exists on another task owned by admin
      const adminTask2 = page.locator('text="Owner: admin@test.com"').last().locator('..').locator('..');
      await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();
      
      // Count total Delete buttons - should be 3 (one for each task)
      const deleteButtons = page.getByRole('button', { name: 'Delete' });
      await expect(deleteButtons).toHaveCount(3);
    });
    
    test('should verify Delete button presence at DOM level for admin on all tasks', async ({ page }) => {
      await page.goto(baseUrl);
      
      // Login as administrator
      await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.waitForURL('**/dashboard');
      
      // Verify at DOM level that Delete buttons exist for all tasks
      const taskList = page.getByRole('region', { name: 'Task list' });
      const allDeleteButtons = taskList.getByRole('button', { name: 'Delete' });
      
      // Should have exactly 3 Delete buttons (one per task)
      const count = await allDeleteButtons.count();
      expect(count).toBe(3);
      
      // Verify each Delete button is attached to DOM
      for (let i = 0; i < count; i++) {
        await expect(allDeleteButtons.nth(i)).toBeAttached();
      }
    });
  });
  
  test.describe('AC_02: User Restriction - Delete button only on own tasks', () => {
    
    test('should only display Delete button on tasks owned by the user', async ({ page }) => {
      // Navigate to login page
      await page.goto(baseUrl);
      
      // Login as standard user
      await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      // Wait for dashboard to load
      await page.waitForURL('**/dashboard');
      await expect(page.getByRole('region', { name: 'Task list' })).toBeVisible();
      
      // Verify user only sees their own task
      await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
      
      // Verify Delete button exists on user's own task
      const deleteButton = page.getByRole('button', { name: 'Delete' });
      await expect(deleteButton).toBeVisible();
      await expect(deleteButton).toHaveCount(1);
    });
    
    test('should NOT display Delete button on tasks owned by administrator', async ({ page }) => {
      await page.goto(baseUrl);
      
      // Login as standard user
      await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.waitForURL('**/dashboard');
      
      // Verify admin-owned tasks are not visible at all
      await expect(page.getByRole('heading', { name: 'Prepare thesis proposal' })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: 'Set up E2E baseline' })).not.toBeVisible();
      
      // Verify owner information for admin tasks is not present
      await expect(page.getByText('Owner: admin@test.com')).not.toBeVisible();
      
      // Verify only 1 Delete button exists (for user's own task)
      const deleteButtons = page.getByRole('button', { name: 'Delete' });
      await expect(deleteButtons).toHaveCount(1);
    });
    
    test('should verify absence of Delete button at DOM level for admin-owned tasks', async ({ page }) => {
      await page.goto(baseUrl);
      
      // Login as standard user
      await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.waitForURL('**/dashboard');
      
      const taskList = page.getByRole('region', { name: 'Task list' });
      
      // Verify at DOM level: only 1 Delete button exists
      const deleteButtons = taskList.getByRole('button', { name: 'Delete' });
      const count = await deleteButtons.count();
      expect(count).toBe(1);
      
      // Verify the single Delete button is attached and visible
      await expect(deleteButtons.first()).toBeAttached();
      await expect(deleteButtons.first()).toBeVisible();
      
      // Verify admin-owned task elements are not in DOM
      const adminTaskHeading1 = page.getByRole('heading', { name: 'Prepare thesis proposal' });
      const adminTaskHeading2 = page.getByRole('heading', { name: 'Set up E2E baseline' });
      
      await expect(adminTaskHeading1).not.toBeAttached();
      await expect(adminTaskHeading2).not.toBeAttached();
    });
    
    test('should verify user can only see and interact with their own task', async ({ page }) => {
      await page.goto(baseUrl);
      
      // Login as standard user
      await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      
      await page.waitForURL('**/dashboard');
      
      // Verify only user's task is visible
      const userTask = page.getByRole('heading', { name: 'Review related papers' });
      await expect(userTask).toBeVisible();
      
      // Verify the task has both Edit and Delete buttons
      const taskContainer = userTask.locator('../..');
      await expect(taskContainer.getByRole('button', { name: 'Edit' })).toBeVisible();
      await expect(taskContainer.getByRole('button', { name: 'Delete' })).toBeVisible();
      
      // Verify total task count is 1
      const allHeadings = page.getByRole('region', { name: 'Task list' }).getByRole('heading', { level: 3 });
      await expect(allHeadings).toHaveCount(1);
    });
  });
  
  test.describe('Cross-verification: Admin vs User permissions', () => {
    
    test('should demonstrate different Delete button visibility between admin and user', async ({ page }) => {
      // First, login as admin and count Delete buttons
      await page.goto(baseUrl);
      await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('**/dashboard');
      
      const adminDeleteCount = await page.getByRole('button', { name: 'Delete' }).count();
      expect(adminDeleteCount).toBe(3);
      
      // Logout
      await page.getByRole('button', { name: 'Logout' }).click();
      await page.waitForURL('**/login');
      
      // Login as user and count Delete buttons
      await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('password123');
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('**/dashboard');
      
      const userDeleteCount = await page.getByRole('button', { name: 'Delete' }).count();
      expect(userDeleteCount).toBe(1);
      
      // Verify the difference
      expect(adminDeleteCount).toBeGreaterThan(userDeleteCount);
    });
  });
});