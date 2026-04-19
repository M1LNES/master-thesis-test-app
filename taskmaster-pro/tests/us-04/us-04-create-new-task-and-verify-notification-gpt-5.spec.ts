import { test, expect } from '@playwright/test';

const baseUrl: string = 'http://localhost:3000';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Able to log in with user@test.com/password123 and reach /dashboard
 * - [PASS] 'New Task' button opens the 'Create New Task' modal dialog
 * - [PASS] Submitting with empty Title is prevented by required field validation (input.checkValidity() === false)
 * - [PASS] Filling Title with "Test Task" and selecting a Priority works
 * - [PASS] Clicking 'Save Task' closes the modal automatically
 * - [PASS] Newly created "Test Task" appears in the dashboard Task list
 * - [PASS] Success toast "Task created successfully" appears
 * - Note: The UI uses 'Save Task' (not 'Save'); test uses the actual observed text.
 */

test.describe('[US-04] Create New Task and Verify Notification', () => {
  test('should prevent save on empty title, then create task and show success toast when valid', async ({ page }) => {
    // 1) Start at base URL and log in
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // 2) Click 'New Task' to open modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // 3) Leave Title empty and click 'Save Task'
    const titleInput = page.getByLabel('Title');
    await expect(titleInput).toBeVisible();
    // Ensure field is empty
    await titleInput.fill('');
    await page.getByRole('button', { name: 'Save Task' }).click();

    // 4) Verify form submission is prevented (modal remains open and input invalid)
    await expect(modal).toBeVisible();
    const titleValidity = await titleInput.evaluate((el: HTMLInputElement) => ({
      valid: el.checkValidity(),
      valueMissing: el.validity.valueMissing,
      required: el.required === true || el.getAttribute('required') !== null,
    }));
    expect(titleValidity.required).toBe(true);
    expect(titleValidity.valid).toBe(false);
    expect(titleValidity.valueMissing).toBe(true);

    // 5) Fill Title and select Priority
    await titleInput.fill('Test Task');
    await page.getByLabel('Priority').selectOption('High');

    // 6) Click 'Save Task' and verify modal closes
    await page.getByRole('button', { name: 'Save Task' }).click();
    await expect(modal).toBeHidden();

    // 7) Verify "Test Task" is visible in the dashboard task list
    const taskList = page.getByRole('region', { name: 'Task list' });
    await expect(taskList.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // 8) Verify a success Toast notification appears
    await expect(page.getByText('Task created successfully', { exact: true })).toBeVisible();
  });
});