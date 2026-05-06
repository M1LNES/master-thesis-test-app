import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01: Confirmation dialog appears when 'Delete' button is clicked.
 * - [PASS] AC_02: Task is removed and success Toast notification is displayed upon confirming deletion.
 */

test.describe('Task Deletion Confirmation Flow', () => {
  test('should display confirmation dialog when delete button is clicked', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL(baseUrl + '/dashboard');
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Verify confirmation dialog appears
    const dialog = await page.waitForEvent('dialog');
    expect(dialog.message()).toContain('Delete task "Review related papers"?');
    await dialog.accept();
  });

  test('should remove task and show success notification when deletion is confirmed', async ({ page }) => {
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await page.waitForURL(baseUrl + '/dashboard');
    await page.getByRole('button', { name: 'Delete' }).click();
    
    // Handle confirmation dialog
    const dialog = await page.waitForEvent('dialog');
    await dialog.accept();
    
    // Verify task is removed
    await expect(page.getByRole('heading', { name: 'Review related papers' })).not.toBeVisible();
    
    // Verify success Toast notification
    await expect(page.getByText('Task successfully deleted')).toBeVisible();
  });
});