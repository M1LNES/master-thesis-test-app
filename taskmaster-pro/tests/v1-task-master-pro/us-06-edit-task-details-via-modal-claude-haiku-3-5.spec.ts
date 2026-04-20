import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('Task Edit Modal Functionality', () => {
  test('should update task priority via edit modal without leaving dashboard', async ({ page }) => {
    // Navigate to the application
    await page.goto(baseUrl);

    // Login
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Find and click the Edit button for the first task
    const editButton = page.getByRole('button', { name: 'Edit' });
    await editButton.click();

    // Verify edit modal opens
    const editModal = page.getByRole('dialog', { name: 'Edit Task' });
    await expect(editModal).toBeVisible();

    // Verify input fields are pre-populated
    const titleInput = page.getByRole('textbox', { name: 'Title' });
    const descriptionInput = page.getByRole('textbox', { name: 'Description' });
    const prioritySelect = page.getByRole('combobox', { name: 'Priority' });

    await expect(titleInput).toHaveValue('Review related papers');
    await expect(descriptionInput).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(prioritySelect).toHaveValue('Medium');

    // Change priority
    await prioritySelect.selectOption('High');

    // Save the task
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Verify modal closes
    await expect(editModal).not.toBeVisible();

    // Verify task priority is updated in the list
    const updatedPriorityElement = page.getByText('High');
    await expect(updatedPriorityElement).toBeVisible();
  });
});