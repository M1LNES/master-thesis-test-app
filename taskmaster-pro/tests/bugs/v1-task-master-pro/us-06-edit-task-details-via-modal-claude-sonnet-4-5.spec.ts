/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login with user@test.com and password123 works correctly
 * - [PASS] Edit button on existing task is clickable
 * - [PASS] Edit modal opens with pre-populated task data (title, description, priority)
 * - [PASS] Priority field can be changed to a different option
 * - [PASS] Save button updates the task successfully
 * - [FAIL] Modal does NOT close automatically after saving (expected to close, but remains open)
 * - [PASS] Task in dashboard displays updated Priority after save
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should update task priority via edit modal', async ({ page }) => {
    // Criterion 1: Log in using user@test.com and password123
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Store the original priority value
    const taskCard = page.locator('region[aria-label="Task list"]').first();
    const originalPriority = await taskCard.getByText('Medium').textContent();
    expect(originalPriority).toBe('Medium');
    
    // Criterion 2: Click the 'Edit' button on an existing task
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // Criterion 3: Verify that the edit modal opens and fields are pre-populated
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    
    // Verify pre-populated fields
    const titleInput = editModal.getByRole('textbox', { name: 'Title' });
    const descriptionInput = editModal.getByRole('textbox', { name: 'Description' });
    const prioritySelect = editModal.getByLabel('Priority');
    
    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(prioritySelect).toHaveValue('Medium');
    
    // Criterion 4: Change the value in the 'Priority' field to a different option
    await prioritySelect.selectOption('High');
    await expect(prioritySelect).toHaveValue('High');
    
    // Criterion 5: Click the 'Save' button
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
    
    // Criterion 6: Verify that the edit modal closes automatically
    // Note: This is expected to fail - modal does not close automatically
    await expect(editModal).not.toBeVisible({ timeout: 3000 });
    
    // Criterion 7: Verify that the task displays the updated Priority
    const updatedPriority = taskCard.getByText('High');
    await expect(updatedPriority).toBeVisible();
  });

  test.fail('should close edit modal automatically after saving (known bug)', async ({ page }) => {
    // This test documents the expected behavior that currently fails
    
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    
    // Change priority and save
    await editModal.getByLabel('Priority').selectOption('Low');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
    
    // EXPECTED: Modal should close automatically
    // ACTUAL: Modal remains open (this assertion will fail, which is expected)
    await expect(editModal).not.toBeVisible({ timeout: 5000 });
  });

  test('should allow manual closing of edit modal after save', async ({ page }) => {
    // Workaround test: verify modal can be closed manually
    
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    
    // Change priority and save
    await editModal.getByLabel('Priority').selectOption('High');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
    
    // Modal should still be visible (current behavior)
    await expect(editModal).toBeVisible();
    
    // Manually close the modal
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify modal is now closed
    await expect(editModal).not.toBeVisible();
    
    // Verify the task was updated
    const taskCard = page.locator('region[aria-label="Task list"]').first();
    await expect(taskCard.getByText('High')).toBeVisible();
  });

  test('should preserve other task fields when only changing priority', async ({ page }) => {
    // Additional test: verify that only the changed field is updated
    
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Store original task data
    const taskCard = page.locator('region[aria-label="Task list"]').first();
    const originalTitle = await taskCard.getByRole('heading', { level: 3 }).textContent();
    const originalDescription = await taskCard.getByRole('paragraph').textContent();
    
    // Open edit modal and change only priority
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await editModal.getByLabel('Priority').selectOption('Low');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Close modal manually (workaround for auto-close bug)
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify title and description remain unchanged
    await expect(taskCard.getByRole('heading', { level: 3 })).toHaveText(originalTitle || '');
    await expect(taskCard.getByRole('paragraph')).toHaveText(originalDescription || '');
    
    // Verify only priority changed
    await expect(taskCard.getByText('Low')).toBeVisible();
  });
});