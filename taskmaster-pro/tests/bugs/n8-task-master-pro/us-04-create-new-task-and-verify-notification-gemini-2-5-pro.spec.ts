/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC #1: User can log in successfully.
 * - [PASS] AC #2: 'New Task' button opens the creation modal.
 * - [FAIL] AC #3 & #4: The form submits even when the Title field is empty. The acceptance criteria state that submission should be prevented. A new task named "(Untitled Task)" is created instead. The test `should prevent submission when the title is empty` is marked with `test.fail()` to reflect this bug.
 * - [PASS] AC #5: The form fields for Title and Priority can be filled successfully.
 * - [PASS] AC #6: The modal closes automatically after a successful submission.
 * - [PASS] AC #7: The newly created task is visible in the dashboard task list.
 * - [PASS] AC #8: A success toast notification appears after task creation.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

test.describe('[US-04] Create New Task and Verify Notification', () => {
  // 1. Start at the base URL and log in.
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');
  });

  test('should prevent submission when the title is empty', async ({ page }) => {
    // This test is expected to fail due to a bug in the application.
    // The application currently allows creating a task with an empty title.
    test.fail();

    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();

    // 3. Leave the Title field completely empty and click 'Save'.
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4. Verify that the form submission is prevented.
    // The modal should remain open.
    await expect(page.getByRole('dialog', { name: 'Create New Task' })).toBeVisible();
    
    // Also, verify that no "(Untitled Task)" was added to the dashboard.
    await expect(page.getByRole('heading', { name: '(Untitled Task)' })).not.toBeVisible();
  });

  test('should create a new task and display a success notification', async ({ page }) => {
    // 2. Click the 'New Task' button to open the creation modal.
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // 5. Fill the Title field with "Test Task" and select a Priority.
    await page.getByLabel('Title').fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    // 6. Click 'Save' and verify that the modal automatically closes.
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(modal).not.toBeVisible();

    // 8. Verify that a success Toast notification appears on the screen.
    await expect(page.getByText('Task created successfully')).toBeVisible();
    
    // 7. Verify that the newly created "Test Task" is visible in the dashboard task list.
    const taskList = page.getByRole('region', { name: 'Task list' });
    const newTask = taskList.locator('div', { has: page.getByRole('heading', { name: 'Test Task' }) }).first();
    
    await expect(newTask).toBeVisible();
    await expect(newTask.getByText('High')).toBeVisible();
  });
});