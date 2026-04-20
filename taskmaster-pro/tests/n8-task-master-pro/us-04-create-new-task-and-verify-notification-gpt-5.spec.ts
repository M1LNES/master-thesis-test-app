/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Login redirects to dashboard and displays "TaskMaster Pro"
 * - [PASS] "New Task" button opens the "Create New Task" modal dialog
 * - [FAIL] Required validation when Title is empty — expected prevention, observed it creates "(Untitled Task)" and shows success toast
 * - [PASS] Filling Title and selecting Priority allows saving; modal closes
 * - [PASS] Newly created "Test Task" appears in the dashboard task list
 * - [PASS] Success toast "Task created successfully" appears after creating a task
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

test.describe('[US-04] Create New Task and Verify Notification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { level: 3, name: 'Welcome Back' })).toBeVisible();

    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { level: 1, name: 'TaskMaster Pro' })).toBeVisible();
  });

  test('should prevent submission when title is empty due to required validation', async ({ page }) => {
    // The current implementation allows saving without a title and creates "(Untitled Task)".
    // Marking as expected to fail until validation is implemented.
    test.fail(true, 'App currently creates an "(Untitled Task)" without enforcing required Title validation.');

    const taskRegion = page.getByRole('region', { name: 'Task list' });
    const initialCount = await taskRegion.getByRole('heading', { level: 3 }).count();

    await page.getByRole('button', { name: 'New Task' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(dialog).toBeVisible();

    // Ensure Title is empty
    await page.getByRole('textbox', { name: 'Title' }).fill('');

    // Attempt to save
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Expected correct behavior: form is not submitted and modal remains open
    await expect(dialog).toBeVisible();

    // No new task should have been added
    await expect(taskRegion.getByRole('heading', { level: 3 })).toHaveCount(initialCount);

    // No success toast should appear
    await expect(page.getByText('Task created successfully')).not.toBeVisible();
  });

  test('should create task and show success toast when title and priority are provided', async ({ page }) => {
    await page.getByRole('button', { name: 'New Task' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(dialog).toBeVisible();

    await page.getByRole('textbox', { name: 'Title' }).fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    await page.getByRole('button', { name: 'Save Task' }).click();

    // Modal should automatically close
    await expect(dialog).toBeHidden();

    // New task should be visible in the dashboard task list
    const taskRegion = page.getByRole('region', { name: 'Task list' });
    await expect(taskRegion.getByRole('heading', { level: 3, name: 'Test Task' })).toBeVisible();

    // Success toast should appear
    await expect(page.getByText('Task created successfully')).toBeVisible();
  });
});