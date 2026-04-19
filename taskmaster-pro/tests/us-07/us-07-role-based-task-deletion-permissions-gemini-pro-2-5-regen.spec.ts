import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';
const adminEmail = 'admin@test.com';
const userEmail = 'user@test.com';
const password = 'password123';

/**
 * A helper function to log into the application.
 * @param page The Playwright page object.
 * @param email The email for the user to log in as.
 */
async function login(page: any, email: string) {
  await page.goto(baseUrl + '/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
}

test.describe('[US-07] Role-Based Task Deletion Permissions', () => {

  test('AC_01: Admin should see delete button on all tasks', async ({ page }) => {
    await login(page, adminEmail);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // The snapshot shows task cards are generic divs, not articles.
    // A robust way to select a card is to find a container that has a specific heading.
    const taskList = page.getByRole('region', { name: 'Task list' });

    // Find the container for the admin's task and check for the delete button
    const adminTaskContainer = taskList.locator('div').filter({
      has: page.getByRole('heading', { name: 'Prepare thesis proposal' })
    });
    await expect(adminTaskContainer.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Find the container for the user's task and check for the delete button
    const userTaskContainer = taskList.locator('div').filter({
      has: page.getByRole('heading', { name: 'Review related papers' })
    });
    await expect(userTaskContainer.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('AC_02: User should only see delete button on their own tasks', async ({ page }) => {
    await login(page, userEmail);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    const taskList = page.getByRole('region', { name: 'Task list' });

    // Verify user sees the delete button on their own task
    const userTaskContainer = taskList.locator('div').filter({
      has: page.getByRole('heading', { name: 'Review related papers' })
    });
    await expect(userTaskContainer.getByRole('button', { name: 'Delete' })).toBeVisible();

    // Verify that the admin's tasks are not visible at all in the DOM for the user
    const adminTaskHeading = page.getByRole('heading', { name: 'Prepare thesis proposal' });
    await expect(adminTaskHeading).not.toBeVisible();
  });

});