import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByText('EmailPasswordLoginNeed an').click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@');
  await page.getByRole('textbox', { name: 'Email' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Manual steps - verify that admin sees the other user's tasks and its delete button
  await page.getByText('Review related papersMediumOwner: user@test.comSummarize 5 papers and compare').getByRole('button', { name: 'Delete' }).isVisible();

  // Manual steps - now verify there are delete buttons at other tasks as well
  await expect(page.getByText('Set up E2E baselineLowOwner: admin@test.comCreate deterministic test scenarios').getByRole('button', { name: 'Delete' })).toBeVisible(); 
  await expect(page.getByText('Prepare thesis proposalHighOwner: admin@test.comDraft the scope and timeline').getByRole('button', { name: 'Delete' })).toBeVisible();

  // Now logout out and log in as a normal user

  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Manual step - we should see the delete button at our own task 
  await expect(page.getByText('Review related papersMediumSummarize 5 papers and compare methodology sections.').getByRole('button', { name: 'Delete' })).toBeVisible();
  // Manual step - this element should no longer be visible
  await expect(page.getByText('Set up E2E baselineLowOwner: admin@test.comCreate deterministic test scenarios')).not.toBeVisible(); 
  await expect(page.getByText('Review related papersMediumSummarize 5 papers and compare methodology sections.')).toBeVisible();
});