/**
 * IMPLEMENTATION NOTES:
 * - [PASS] Log in is not required; user is already on dashboard and tasks are visible.
 * - [PASS] Clicking 'Edit' on a task opens the edit modal, with fields pre-populated.
 * - [PASS] Changing the 'Priority' field and clicking 'Save Task' updates the task in the dashboard list.
 * - [FAIL] The edit modal does NOT close automatically after saving; it remains open (possible implementation bug).
 * - [PASS] The updated Priority is reflected in the dashboard list after saving.
 */

import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=v1s8yl3c';

test.describe('[US-06] Edit Task details via Modal', () => {
  test('should open edit modal with pre-populated fields when Edit is clicked', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();

    // Click the Edit button for the first task
    await page.getByRole('button', { name: 'Edit' }).click();

    // Modal should open with pre-populated fields
    await expect(page.getByRole('dialog', { name: 'Edit Task' })).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveValue('Review related papers');
    await expect(page.getByLabel('Description')).toHaveValue('Summarize 5 papers and compare methodology sections.');
    await expect(page.getByLabel('Priority')).toHaveValue('Medium');
  });

  test('should update Priority and reflect change in dashboard list', async ({ page }) => {
    await page.goto(baseUrl);

    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).click();

    // Change Priority to 'High'
    await page.getByLabel('Priority').selectOption('High');
    await expect(page.getByLabel('Priority')).toHaveValue('High');

    // Save changes
    await page.getByRole('button', { name: 'Save Task' }).click();

    // The dashboard list should now show 'High' for the task
    await expect(page.getByRole('heading', { name: 'Review related papers' })).toBeVisible();
    await expect(page.getByText('High')).toBeVisible();
  });

  test('should close the edit modal automatically after saving (expected, but currently fails)', async ({ page }) => {
    test.fail(true, 'Edit modal does not close automatically after saving (implementation bug observed)');
    await page.goto(baseUrl);

    // Open edit modal
    await page.getByRole('button', { name: 'Edit' }).click();

    // Change Priority to 'Low' (to ensure a change)
    await page.getByLabel('Priority').selectOption('Low');
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Modal should close automatically (expected behavior)
    await expect(page.getByRole('dialog', { name: 'Edit Task' })).not.toBeVisible();
  });
});