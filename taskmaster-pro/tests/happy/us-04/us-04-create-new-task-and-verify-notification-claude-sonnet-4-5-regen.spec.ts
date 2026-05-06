import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-04] Create New Task and Verify Notification', () => {
  test('should create a new task with validation and show success notification', async ({ page }) => {
    // AC1: Start at the base URL and log in
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/.*\/login/);
    
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro', level: 1 })).toBeVisible();
    
    // AC2: Click the 'New Task' button to open the creation modal
    await page.getByRole('button', { name: 'New Task' }).click();
    
    // Verify modal is open
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Create New Task', level: 2 })).toBeVisible();
    
    // AC3: Leave the Title field completely empty and click 'Save'
    const titleField = page.getByRole('textbox', { name: 'Title' });
    await expect(titleField).toBeEmpty();
    
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // AC4: Verify that the form submission is prevented due to required field validation
    // Modal should still be visible (not closed)
    await expect(modal).toBeVisible();
    
    // AC5: Fill the Title field with "Test Task" and select a Priority
    await titleField.fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');
    
    // AC6: Click 'Save' and verify that the modal automatically closes
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Wait for modal to close
    await expect(modal).not.toBeVisible();
    
    // AC7: Verify that the newly created "Test Task" is visible in the dashboard task list
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Test Task', level: 3 })).toBeVisible();
    
    // Verify the priority is displayed
    await expect(taskList.getByText('High')).toBeVisible();
    
    // AC8: Verify that a success Toast notification appears on the screen
    const notificationRegion = page.getByRole('region', { name: /Notifications/ });
    await expect(notificationRegion.getByText('Task created successfully')).toBeVisible();
  });

  test('should prevent task creation when title is empty', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Count existing tasks
    const taskList = page.getByRole('region', { name: 'Task list' });
    const initialTaskCount = await taskList.getByRole('heading', { level: 3 }).count();
    
    // Open modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();
    
    // Try to save without title
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Modal should remain open
    await expect(modal).toBeVisible();
    
    // Task count should remain the same (no new task created)
    const finalTaskCount = await taskList.getByRole('heading', { level: 3 }).count();
    expect(finalTaskCount).toBe(initialTaskCount);
  });

  test('should create task with different priority levels', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Create task with Low priority
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Low Priority Task');
    await page.getByLabel('Priority').selectOption('Low');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    // Verify task is created
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Low Priority Task', level: 3 })).toBeVisible();
    
    // Verify toast notification
    const notificationRegion = page.getByRole('region', { name: /Notifications/ });
    await expect(notificationRegion.getByText('Task created successfully')).toBeVisible();
  });

  test('should close modal when Cancel button is clicked', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
    
    // Open modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();
    
    // Fill in some data
    await page.getByRole('textbox', { name: 'Title' }).fill('Task to Cancel');
    
    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Modal should close
    await expect(modal).not.toBeVisible();
    
    // Task should not be created
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Task to Cancel', level: 3 })).not.toBeVisible();
  });
});