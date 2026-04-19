/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State): Upon accessing the application unauthenticated, the user is presented with the login interface where input fields must be empty by default.
 * - [PARTIAL PASS] AC_02 (Empty Submission): Attempting to submit the login form without providing both an email and a password is blocked by local validation (no navigation occurs, email field gets focus), but no explicit "local validation warnings" text is observed. The test will assert that the URL remains the same and the email field is focused.
 * - [PASS] AC_03 (Invalid Credentials): Submitting the form with an incorrect email or password now triggers a clearly visible "Invalid credentials" error message, as confirmed by re-inspection.
 */
import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('Login Validation and Error Handling', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('should display empty input fields on initial load (AC_01)', async ({ page }) => {
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });

    await expect(emailInput).toBeEmpty();
    await expect(passwordInput).toBeEmpty();
  });

  test('should block empty submission with local validation (AC_02)', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click();

    // Assert that the page remains on the login URL
    await expect(page).toHaveURL(baseUrl + '/login');
    // We expect the email field to receive focus due to browser-level validation
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeFocused();
    // No explicit error message is visible, so we can't assert against one.
    // The lack of navigation implies local validation blocking the submission.
  });

  test('should display "Invalid credentials" error message for incorrect login (AC_03)', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(baseUrl + '/login'); // Should remain on login page
  });
});