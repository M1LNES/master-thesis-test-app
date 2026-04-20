/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Admin can see Delete buttons on all tasks regardless of owner
 * - [FAIL] AC_02: Standard user currently sees Delete buttons on ALL tasks, including admin-owned tasks.
 *   Expected behavior: user should only see Delete button on their own tasks.
 *   The test is written with correct assertions and marked with test.fail() until the bug is fixed.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=c2n7zr8p';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

test.describe('Role-Based Task Deletion Permissions', () => {
  
  test('AC_01: Admin should see Delete button on all tasks regardless of owner', async ({ page }) => {
    // Navigate to login page
    await page.goto(baseUrl);
    await page.waitForURL('**/login');
    
    // Login as administrator
    await page.getByRole('textbox', { name: 'Email' }).fill(adminEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Verify admin sees Delete button on admin-owned task
    const adminTask1 = page.getByRole('heading', { name: 'Prepare thesis proposal' }).locator('..');
    await expect(adminTask1.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // Verify admin sees Delete button on user-owned task
    const userTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..');
    await expect(userTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // Verify admin sees Delete button on another admin-owned task
    const adminTask2 = page.getByRole('heading', { name: 'Set up E2E baseline' }).locator('..');
    await expect(adminTask2.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
  
  test('AC_02: Standard user should only see Delete button on their own tasks', async ({ page }) => {
    test.fail(); // Expected to fail - implementation bug: user can see delete buttons on all tasks
    
    // Navigate to login page
    await page.goto(baseUrl);
    await page.waitForURL('**/login');
    
    // Login as standard user
    await page.getByRole('textbox', { name: 'Email' }).fill(userEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Verify user DOES see Delete button on their own task
    const ownTask = page.getByRole('heading', { name: 'Review related papers' }).locator('..');
    await expect(ownTask.getByRole('button', { name: 'Delete' })).toBeVisible();
    
    // Verify user does NOT see Delete button on admin-owned tasks (DOM level check)
    const adminTask1Container = page.getByRole('heading', { name: 'Prepare thesis proposal' }).locator('..');
    await expect(adminTask1Container.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    
    const adminTask2Container = page.getByRole('heading', { name: 'Set up E2E baseline' }).locator('..');
    await expect(adminTask2Container.getByRole('button', { name: 'Delete' })).not.toBeVisible();
    
    // Additional DOM-level verification that Delete buttons don't exist in the DOM
    const adminTask1DeleteCount = await adminTask1Container.getByRole('button', { name: 'Delete' }).count();
    expect(adminTask1DeleteCount).toBe(0);
    
    const adminTask2DeleteCount = await adminTask2Container.getByRole('button', { name: 'Delete' }).count();
    expect(adminTask2DeleteCount).toBe(0);
  });
  
  test('AC_02 (Alternative): Verify Delete button absence at DOM level for admin tasks when logged in as user', async ({ page }) => {
    test.fail(); // Expected to fail - implementation bug
    
    // Navigate and login as standard user
    await page.goto(baseUrl);
    await page.waitForURL('**/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(userEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Use evaluate to check DOM structure directly
    const deleteButtonsPerTask = await page.evaluate(() => {
      const taskTitles = ['Prepare thesis proposal', 'Review related papers', 'Set up E2E baseline'];
      
      return taskTitles.map(titleText => {
        const h3 = Array.from(document.querySelectorAll('h3')).find(h => 
          h.textContent.trim() === titleText
        );
        
        if (!h3) return { title: titleText, hasDeleteButton: null };
        
        // Find the task card container
        let container = h3.parentElement;
        let depth = 0;
        while (container && depth < 10) {
          const buttons = Array.from(container.querySelectorAll('button'));
          const deleteBtn = buttons.find(b => b.textContent.trim() === 'Delete');
          
          if (buttons.length > 0) {
            return {
              title: titleText,
              hasDeleteButton: !!deleteBtn
            };
          }
          
          container = container.parentElement;
          depth++;
        }
        
        return { title: titleText, hasDeleteButton: false };
      });
    });
    
    // User's own task should have Delete button
    const ownTask = deleteButtonsPerTask.find(t => t.title === 'Review related papers');
    expect(ownTask?.hasDeleteButton).toBe(true);
    
    // Admin's tasks should NOT have Delete button
    const adminTask1 = deleteButtonsPerTask.find(t => t.title === 'Prepare thesis proposal');
    expect(adminTask1?.hasDeleteButton).toBe(false);
    
    const adminTask2 = deleteButtonsPerTask.find(t => t.title === 'Set up E2E baseline');
    expect(adminTask2?.hasDeleteButton).toBe(false);
  });
});