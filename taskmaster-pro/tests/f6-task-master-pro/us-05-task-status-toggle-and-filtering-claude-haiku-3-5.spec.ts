import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=f6j2qp9w';

test.describe('Task Status Toggle and Filtering', () => {
  test('should toggle task status and filter tasks correctly', async ({ page }) => {
    // Navigate and login
    await page.goto(baseUrl);
    await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("TaskMaster Pro")');

    // Find an active task and its checkbox
    const taskCheckbox = page.getByRole('checkbox', { name: 'Mark as done' }).first();
    const taskHeading = page.getByRole('heading', { level: 3 }).first();
    const taskText = await taskHeading.textContent();

    // Click the checkbox to mark as completed
    await taskCheckbox.click();

    // Verify checkbox is checked (visually or via attribute)
    await expect(taskCheckbox).toBeChecked();

    // Click 'Active' filter
    await page.getByRole('radio', { name: 'Active' }).click();

    // Wait for list to update
    await page.waitForFunction(() => {
      const tasks = document.querySelectorAll('h3');
      return !Array.from(tasks).some(task => task.textContent === taskText);
    });

    // Verify task is not in active list
    const activeTaskHeadings = await page.getByRole('heading', { level: 3 }).allTextContents();
    expect(activeTaskHeadings).not.toContain(taskText);

    // Click 'Completed' filter
    await page.getByRole('radio', { name: 'Completed' }).click();

    // Wait for list to update
    await page.waitForFunction(() => {
      const tasks = document.querySelectorAll('h3');
      return Array.from(tasks).some(task => task.textContent === taskText);
    });

    // Verify task is in completed list
    const completedTaskHeadings = await page.getByRole('heading', { level: 3 }).allTextContents();
    expect(completedTaskHeadings).toContain(taskText);
  });
});