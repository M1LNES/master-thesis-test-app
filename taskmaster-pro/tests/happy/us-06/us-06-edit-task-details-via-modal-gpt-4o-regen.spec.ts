import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in using `user@test.com` and `password123`.
 * - [PASS] Click the 'Edit' button on an existing task in the list.
 * - [PASS] Verify that the edit modal opens and the input fields are pre-populated with the task's current data.
 * - [PASS] Change the value in the 'Priority' field to a different option.
 * - [PASS] Click the 'Save' button.
 * - [PASS] Verify that the edit modal closes automatically.
 * - [PASS] Verify that the task in the dashboard list now displays the updated Priority.
 */

test.describe('Edit Task details via Modal', () => {
  test('should update task priority without navigating away from the dashboard', async ({ page }) => {
    // Step 1: Log in
    await page.goto(baseUrl + '/login');
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Step 2: Click the 'Edit' button on an existing task
    await page.getByRole('button', { name: 'Edit' }).click();

    // Step 3: Verify that the edit modal opens and input fields are pre-populated
    const modalTitle = await page.getByRole('heading', { name: 'Edit Task' });
    await expect(modalTitle).toBeVisible();
    const currentPriority = await page.getByLabel('Priority').inputValue();
    expect(currentPriority).toBe('Medium');

    // Step 4: Change the value in the 'Priority' field
    await page.getByLabel('Priority').selectOption('High');

    // Step 5: Click the 'Save' button
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Step 6: Verify that the edit modal closes automatically
    await expect(modalTitle).not.toBeVisible();

    // Step 7: Verify that the task in the dashboard list now displays the updated Priority
    const updatedPriority = await page.locator('text=Review related papers').locator('..').locator('text=High');
    await expect(updatedPriority).toBeVisible();
  });
});