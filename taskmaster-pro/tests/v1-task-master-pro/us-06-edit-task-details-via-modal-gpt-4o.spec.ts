import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('Edit Task Feature', () => {
  test('should update task priority via modal without navigating away from the dashboard', async ({ page }) => {
    // Step 1: Log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Step 2: Click the 'Edit' button on an existing task
    await page.getByRole('button', { name: 'Edit' }).click();
    
    // Step 3: Verify that the edit modal opens and the input fields are pre-populated
    const modal = page.locator('dialog[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Review related papers');
    await expect(page.getByRole('combobox', { name: 'Priority' })).toHaveValue('Medium');
    
    // Step 4: Change the value in the 'Priority' field to a different option
    await page.getByRole('combobox', { name: 'Priority' }).selectOption('High');
    
    // Step 5: Click the 'Save' button
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Step 6: Verify that the edit modal closes automatically
    await expect(modal).not.toBeVisible();
    
    // Step 7: Verify that the task in the dashboard list now displays the updated Priority
    await expect(page.getByRole('heading', { name: 'Review related papers' }).locator('..').getByText('High')).toBeVisible();
  });
});