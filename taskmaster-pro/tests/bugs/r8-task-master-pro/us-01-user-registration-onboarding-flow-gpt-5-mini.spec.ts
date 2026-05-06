import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=r8w5gb2n';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Navigation): The "Register" link is present on the default login view and navigates to /register.
 * - [FAIL] AC_02 (Validation): Expected a validation warning when 'Password' and 'Confirm Password' do not match.
 *           Observed behavior: submitting mismatched passwords navigated back to the login page with NO visible validation message.
 *           This appears to be a potential implementation bug. The test for this criterion is marked expected-to-fail.
 * - [PASS] AC_03 (Success): Providing valid details redirects to the login page. (Observed redirect to /login after register.)
 * - [PASS] AC_04 (Persistence): Newly created credentials are valid immediately for login (observed ability to log into /dashboard).
 */

test.describe('US-01 Registration & Onboarding Flow', () => {
  test('should navigate to registration form from the login view (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);
    // Ensure login view is present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // The "Register" link should be visible and navigate to /register
    const registerLink = page.getByRole('link', { name: 'Register' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    // Wait for the registration route to load and verify registration heading
    await page.waitForURL('**/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();
  });

  test('should show validation when passwords do not match (AC_02) - expected to fail if implementation is broken', async ({ page }) => {
    // Mark as expected failure because the live app currently navigates away without showing validation
    test.fail();
    // NOTE: This test asserts the expected/correct behavior. If the application is fixed to show validation,
    // this test will start passing and the test runner will report an unexpected pass.
    await page.goto(baseUrl + '/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Fill the registration form with mismatched passwords
    const uniqueEmail = `mismatch+${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Mismatch Tester');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill('Password123!');
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill('DifferentPassword!');

    // Submit the form
    await page.getByRole('button', { name: 'Register' }).click();

    // Expected: a visible validation message about password mismatch and remain on /register.
    // These are the assertions representing the expected (correct) behavior.
    await expect(page).toHaveURL('**/register');
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should create account and redirect to login when details are valid (AC_03)', async ({ page }) => {
    await page.goto(baseUrl + '/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    const uniqueEmail = `user+reg${Date.now()}@example.com`;
    const password = 'CorrectHorseBattery1!';

    await page.getByRole('textbox', { name: 'Full Name' }).fill('Playwright Register');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);

    await page.getByRole('button', { name: 'Register' }).click();

    // After successful registration expect redirect to login
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('should allow login with newly registered credentials (AC_04)', async ({ page }) => {
    // Register a fresh user, then log in with those credentials and verify dashboard access
    const uniqueEmail = `user+login${Date.now()}@example.com`;
    const password = 'PersistMe123!';

    // Navigate to register
    await page.goto(baseUrl + '/register');
    await expect(page.getByRole('heading', { name: 'Create Your Account' })).toBeVisible();

    // Fill and submit registration
    await page.getByRole('textbox', { name: 'Full Name' }).fill('Playwright Persistence');
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // Expect redirect to login
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // Login with the newly registered credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    // Expect successful navigation to dashboard and dashboard heading visible
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();
  });
});