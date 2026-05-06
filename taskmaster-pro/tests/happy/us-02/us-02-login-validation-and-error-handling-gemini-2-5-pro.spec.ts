import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-02] Login Validation and Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  /**
   * AC_01 (Initial State): Upon accessing the application unauthenticated,
   * the user is presented with the login interface where input fields must be empty by default.
   */
  test('should display an empty login form on initial load', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/login/);

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
  });

  /**
   * AC_02 (Empty Submission): Attempting to submit the login form without providing
   * both an email and a password must be blocked by local validation warnings.
   */
  test('should be blocked by local validation when submitting empty credentials', async ({ page }) => {
    // Note: Playwright cannot directly test the browser's validation message UI (the pop-up).
    // The robust way to check this is to verify the input's `validationMessage` property.
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    
    // Attempt to submit
    await page.getByRole('button', { name: 'Login' }).click();

    // Check that the form submission was prevented and validation messages are present
    const emailValidationMessage = await emailInput.evaluate(element => (element as HTMLInputElement).validationMessage);
    const passwordValidationMessage = await passwordInput.evaluate(element => (element as HTMLInputElement).validationMessage);

    expect(emailValidationMessage).not.toBe('');
    expect(passwordValidationMessage).not.toBe('');
  });


  /**
   * AC_03 (Invalid Credentials): Submitting the form with an incorrect email or password
   * must trigger a clearly visible "Invalid credentials" error message.
   */
  test('should show an error message when submitting invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@user.com');
    await page.getByLabel('Password').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Also ensure the page did not navigate away
    await expect(page).toHaveURL(/.*\/login/);
  });

});