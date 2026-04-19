import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const loginEmail = 'user@test.com';
const loginPassword = 'password123';

test.describe('Task Deletion Confirmation Flow', () => {
  test('should display confirmation dialog before deleting a task', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill(loginEmail);
    await page.getByLabel('Password').fill(loginPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Verify task exists
    await expect(page.getByText('My Task')).toBeVisible();

    // Click delete button and verify confirmation dialog
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Are you sure you want to delete this task?')).toBeVisible();
  });

  test('should delete task and show success toast after confirmation', async ({ page }) => {
    // Login
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill(loginEmail);
    await page.getByLabel('Password').fill(loginPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Delete task with confirmation
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify task is removed and success toast is displayed
    await expect(page.getByText('My Task')).not.toBeVisible();
    await expect(page.getByText('Task deleted successfully')).toBeVisible();
  });
});