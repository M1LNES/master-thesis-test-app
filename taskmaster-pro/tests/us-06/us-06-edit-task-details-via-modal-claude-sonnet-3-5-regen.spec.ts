/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC1: Login functionality works correctly
 * - [PASS] AC2: Edit button opens the modal
 * - [PASS] AC3: Modal opens with pre-populated fields
 * - [PASS] AC4: Priority field can be changed
 * - [PASS] AC5: Save button works
 * - [PASS] AC6: Modal closes after save
 * - [PASS] AC7: Priority updates are reflected in the task list
 * - [FAIL] Title field updates - Title changes are NOT saved (implementation bug)
 *   Expected: Title should update when changed in edit modal
 *   Observed: Title remains unchanged after save, only description and priority update
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should update task priority via edit modal without navigating away from dashboard', async ({ page }) => {
    // AC1: Log in using user@test.com and password123
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    
    // Store the original priority value for verification
    const originalPriority = await page.getByText('Medium', { exact: true }).textContent();
    expect(originalPriority).toBe('Medium');
    
    // AC2: Click the 'Edit' button on an existing task in the list
    await page.getByRole('button', { name: 'Edit' }).first().click();
    
    // AC3: Verify that the edit modal opens and the input fields are pre-populated with the task's current data
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    await expect(editModal.getByRole('heading', { name: 'Edit Task' })).toBeVisible();
    
    // Verify pre-populated fields
    const titleInput = editModal.getByRole('textbox', { name: 'Title' });
    const descriptionInput = editModal.getByRole('textbox', { name: 'Description' });
    const prioritySelect = editModal.getByLabel('Priority');
    
    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(prioritySelect).toHaveValue('Medium');
    
    // AC4: Change the value in the 'Priority' field to a different option
    await prioritySelect.selectOption('High');
    await expect(prioritySelect).toHaveValue('High');
    
    // AC5: Click the 'Save' button
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // AC6: Verify that the edit modal closes automatically
    await expect(editModal).not.toBeVisible();
    
    // AC7: Verify that the task in the dashboard list now displays the updated Priority
    await expect(page.getByText('High', { exact: true })).toBeVisible();
    
    // Verify we're still on the dashboard (not navigated away)
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
  });

  test('should cancel edit and keep original task data unchanged', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Get original task data
    const originalTitle = await page.getByRole('heading', { name: 'Review related papers', level: 3 }).textContent();
    const originalPriority = await page.getByText('High', { exact: true }).textContent();
    
    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    
    // Make changes
    await editModal.getByRole('textbox', { name: 'Title' }).fill('Changed Title');
    await editModal.getByLabel('Priority').selectOption('Low');
    
    // Cancel the edit
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify modal closed
    await expect(editModal).not.toBeVisible();
    
    // Verify original data is unchanged
    await expect(page.getByRole('heading', { name: 'Review related papers', level: 3 })).toBeVisible();
    await expect(page.getByText('High', { exact: true })).toBeVisible();
  });

  test('should close edit modal using close button without saving changes', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Get original priority
    const originalPriority = await page.getByText('High', { exact: true }).textContent();
    expect(originalPriority).toBe('High');
    
    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();
    
    // Make a change
    await editModal.getByLabel('Priority').selectOption('Low');
    
    // Close using X button
    await editModal.getByRole('button', { name: 'Close' }).click();
    
    // Verify modal closed and changes not saved
    await expect(editModal).not.toBeVisible();
    await expect(page.getByText('High', { exact: true })).toBeVisible();
  });

  test('should update description and priority simultaneously', async ({ page }) => {
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
    
    // Update description and priority (not title due to implementation bug)
    const newDescription = 'Updated description for testing multiple field changes';
    
    await editModal.getByRole('textbox', { name: 'Description' }).clear();
    await editModal.getByRole('textbox', { name: 'Description' }).fill(newDescription);
    await editModal.getByLabel('Priority').selectOption('Medium');
    
    // Save changes
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify modal closed
    await expect(editModal).not.toBeVisible();
    
    // Verify changes are reflected
    await expect(page.getByText(newDescription)).toBeVisible();
    await expect(page.getByText('Medium', { exact: true })).toBeVisible();
    
    // Verify success notification
    await expect(page.getByText('Task updated successfully')).toBeVisible();
  });

  test.fail('should update title field when edited', async ({ page }) => {
    // This test is expected to fail due to an implementation bug where title updates are not saved
    // Expected: Title should update when changed in edit modal
    // Observed: Title remains unchanged after save
    
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
    
    // Update title
    const newTitle = 'Updated Task Title';
    await editModal.getByRole('textbox', { name: 'Title' }).clear();
    await editModal.getByRole('textbox', { name: 'Title' }).fill(newTitle);
    
    // Save changes
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify modal closed
    await expect(editModal).not.toBeVisible();
    
    // This assertion will fail because the title doesn't actually update
    await expect(page.getByRole('heading', { name: newTitle, level: 3 })).toBeVisible();
  });
});