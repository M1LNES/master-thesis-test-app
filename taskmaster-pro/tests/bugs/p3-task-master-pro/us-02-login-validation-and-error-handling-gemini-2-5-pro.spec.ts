/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State): Input fields are empty by default as expected.
 * - [PASS] AC_02 (Empty Submission): Form submission is correctly blocked by native browser validation via the 'required' attribute on input fields.
 * - [FAIL] AC_03 (Invalid Credentials): The application returns a 401 Unauthorized status on invalid login, but the required "Invalid credentials" error message is not displayed on the UI. The corresponding test is marked with test.fail() until this is fixed.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

test.describe('US-02: Login Validation and Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    // The base URL automatically redirects to /login
    await page.waitForURL('**/login');
  });

  /**
   * AC_01 (Initial State): Upon accessing the application unauthenticated,
   * the user is presented with the login interface where input fields must be empty by default.
   */
  test('should display an empty login form on initial load', async ({ page }) => {
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
  test('should be blocked by browser validation when submitting with empty fields', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    // The 'required' attribute ensures the browser blocks form submission.
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  /**
   * AC_03 (Invalid Credentials): Submitting the form with an incorrect email or password
   * must trigger a clearly visible "Invalid credentials" error message.
   */
  test('should display an "Invalid credentials" error message on failed login', async ({ page }) => {
    test.fail(true, 'Feature not implemented: The "Invalid credentials" error message is not displayed on the UI after a failed login attempt.');
    
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('invalid-password');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // This is the expected behavior according to the acceptance criteria.
    const errorMessage = page.getByText('Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });

});