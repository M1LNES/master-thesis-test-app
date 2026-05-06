import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('dialog', { name: 'Edit Task' }).click();
  
  // Manual steps
  // Firstly, verify that the "Edit Task" dialog is open and visible on the page.
  await expect(page.getByRole('dialog', { name: 'Edit Task' })).toBeVisible();

  // Now check if the prepopulated values in the "Edit Task" dialog are correct.
  // Assuming the task being edited has the following details:
  expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Review related papers");
  expect(page.getByRole("textbox", { name: "Description" })).toHaveValue("Summarize 5 papers and compare methodology sections.");
  expect(page.getByLabel("Priority")).toHaveValue("Medium");


  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Save Task' }).click();

  // Manual step - check if the modal is closed
  expect(page.getByRole('dialog', { name: 'Edit Task' })).not;

  await expect(page.getByText('Review related papersHigh')).toBeVisible();

});