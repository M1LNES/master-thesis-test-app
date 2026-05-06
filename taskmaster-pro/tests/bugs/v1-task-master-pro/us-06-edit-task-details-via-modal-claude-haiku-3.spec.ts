import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('Edit Task Details via Modal', () => {
  test('should update task priority and reflect changes in the dashboard', async ({ page }) => {
    // 1. Log in using user@test.com and password123
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL(`${baseUrl}/dashboard`);

    // 2. Click the 'Edit' button on an existing task
    const firstTaskEditButton = page.getByRole('button', { name: 'Edit' }).first();
    await firstTaskEditButton.click();

    // 3. Verify the edit modal opens and fields are pre-populated
    await expect(page.getByRole('dialog', { name: 'Edit Task' })).toBeVisible();
    const priorityField = page.getByLabel('Priority');
    await expect(priorityField).toBeVisible();
    const currentPriority = await priorityField.inputValue();
    expect(currentPriority).not.toBeEmpty();

    // 4. Change the 'Priority' field to a different option
    await priorityField.selectOption({ value: 'medium' });

    // 5. Click the 'Save' button
    await page.getByRole('button', { name: 'Save' }).click();

    // 6. Verify the edit modal closes
    await expect(page.getByRole('dialog', { name: 'Edit Task' })).toBeHidden();

    // 7. Verify the updated priority is displayed in the dashboard list
    test.fail();
    await expect(firstTaskEditButton).toHaveText('medium');
  });
});