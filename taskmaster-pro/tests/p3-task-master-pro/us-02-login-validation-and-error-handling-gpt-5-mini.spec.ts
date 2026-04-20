import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=p3x9ha1t';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC_01 (Initial State) — Visiting the base URL redirects to /login and the login form is present.
 *           Observed: "Welcome Back" heading, Email and Password textboxes, and Login button. Both inputs are empty by default.
 * - [FAIL] AC_02 (Empty Submission) — Expected client-side/local validation warnings when submitting with empty email/password.
 *           Observed: Clicking "Login" with empty fields does not produce a visible validation message. No aria-invalid or validationMessage was observed in the live app.
 *           (Test marked with test.fail() and asserts the expected correct behavior so future fixes will be detected.)
 * - [FAIL] AC_03 (Invalid Credentials) — Expected a clearly visible "Invalid credentials" error after submitting wrong credentials.
 *           Observed: The app attempted to POST to /api/login and the server returned 401 (Unauthorized). The text "Invalid credentials" was detectable by the DOM tools but it was not visibly presented to the user (not visible).
 *           (Test marked with test.fail() and asserts the expected visible message so future fixes will be detected.)
 */

test.describe('Login Validation and Error Handling (US-02)', () => {
  test('should display the login interface with empty inputs by default (AC_01)', async ({ page }) => {
    await page.goto(baseUrl);

    // The app redirects to /login; ensure we are on the login page
    await expect(page).toHaveURL(/\/login$/);

    // Heading and form controls
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });

    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Inputs should be empty by default
    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');
  });

  test('should block empty submission and show local validation warnings (AC_02)', async ({ page }) => {
    // Implementation appears to be missing or not showing client-side validation warnings.
    // Marking this test as expected to fail until the app shows proper local validation UI.
    test.fail();

    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });

    // Ensure fields are empty to start
    await expect(email).toHaveValue('');
    await expect(password).toHaveValue('');

    // Attempt to submit with empty fields
    await loginButton.click();

    // Expected behavior (what this test asserts): at least one input should report a non-empty validationMessage
    // or the UI should show a visible validation message/alert. We try to detect the validationMessage property.
    const emailValidationMessage = await email.evaluate((el: HTMLInputElement) => el.validationMessage);
    const passwordValidationMessage = await password.evaluate((el: HTMLInputElement) => el.validationMessage);

    // Assert that at least one native validation message is present (i.e., browser blocked submission)
    expect(Boolean(emailValidationMessage || passwordValidationMessage)).toBeTruthy();

    // Additionally, if the app uses visible UI warnings, assert an alert/inline message is visible.
    // This is the expected UI-level behavior; adjust selector if the project uses a different message text.
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('should display "Invalid credentials" when login credentials are incorrect (AC_03)', async ({ page }) => {
    // The live app returned a 401 and the "Invalid credentials" node was present but not visible.
    // We mark this test as expected to fail until the error message is clearly visible to users.
    test.fail();

    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    const email = page.getByRole('textbox', { name: 'Email' });
    const password = page.getByRole('textbox', { name: 'Password' });
    const loginButton = page.getByRole('button', { name: 'Login' });

    await email.fill('wrong@example.com');
    await password.fill('wrongpass');
    await loginButton.click();

    // Expected behavior: a visible error "Invalid credentials" should appear.
    // Use getByText which will wait for the element to become visible.
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});