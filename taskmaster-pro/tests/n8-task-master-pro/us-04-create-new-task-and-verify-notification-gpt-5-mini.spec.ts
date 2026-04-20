import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000?b=n8r4bf6q';

/**
 * IMPLEMENTATION NOTES:
 * - [PASS] AC-01: Start at base URL and log in with user@test.com / password123 — observed; navigation to /dashboard occurs.
 * - [PASS] AC-02: 'New Task' button exists and opens a creation modal titled 'Create New Task' — observed.
 * - [PASS] AC-05: The creation modal includes a Title input and a Priority select (Low / Medium / High) — observed.
 *
 * - [FAIL] AC-04: Required-field validation when Title is left empty could not be reliably observed.
 *           Observed: the modal exists and Save Task is a submit button, but there is no visible "Title is required"
 *           message or `required` attribute on the Title input in the DOM snapshot. Because the implementation
 *           of the validation could not be conclusively verified, the test for this acceptance criterion is
 *           written as an expected-fail (test.fail()) with the correct assertions.
 *
 * - [FAIL] AC-06: Auto-closing modal after a successful save could not be reliably observed in the exploratory runs.
 *           The test that asserts the modal closes after saving is therefore marked as expected-fail.
 *
 * - [FAIL] AC-07: Verifying that a newly created "Test Task" appears in the dashboard task list was not reliably
 *           observed during exploration (the application did not show the created task in the runs). The test
 *           asserting that the new task appears is marked expected-fail.
 *
 * - [FAIL] AC-08: A success Toast notification did not appear in the exploratory snapshots; the presence of a toast
 *           cannot be confirmed. The test asserting a success toast is marked expected-fail.
 *
 * RATIONALE:
 * - Tests only use selectors observed during interactive exploration:
 *   getByLabel('Email'|'Password'|'Title'|'Priority'), getByRole('button', { name: '...' }), getByRole('dialog', { name: 'Create New Task' }), getByRole('heading', { name: 'Test Task' }), getByText(...)
 *
 * - For acceptance criteria that could not be verified, tests are written with the expected assertions and are
 *   intentionally marked with test.fail() so the suite documents the expectation while acknowledging the current
 *   implementation gap.
 */

test.describe('[US-04] Create New Task and Verify Notification', () => {
  test('should allow login and open the New Task creation modal with expected fields', async ({ page }) => {
    // Navigate and log in
    await page.goto(baseUrl);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'TaskMaster Pro' })).toBeVisible();

    // Open New Task modal
    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // Verify Title and Priority fields and Save button exist
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Task' })).toBeVisible();
  });

  test('should prevent submission when Title is empty (EXPECTED FAIL — validation not reliably observed)', async ({ page }) => {
    // Mark this test as expected to fail because the exploratory inspection did not reveal a reliable validation message/behavior
    test.fail();

    // Arrange: login and open modal
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // Act: leave Title empty and click Save
    // (Title input is empty by default according to snapshots)
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Assert: form submission should be prevented => modal remains open (expected behavior)
    await expect(modal).toBeVisible();

    // Additionally we would expect a visible validation message like "Title is required"
    // (Not observed during exploration; if implemented, it should be asserted here)
    await expect(page.getByText(/title.*required/i)).toBeVisible();
  });

  test('should create a new task, close the modal, show task in list and display success toast (EXPECTED FAIL)', async ({ page }) => {
    // Mark as expected-fail because exploration did not reliably show modal auto-close, task persistence, or toast
    test.fail();

    // Arrange: login and open modal
    await page.goto(baseUrl);
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/dashboard');

    await page.getByRole('button', { name: 'New Task' }).click();
    const modal = page.getByRole('dialog', { name: 'Create New Task' });
    await expect(modal).toBeVisible();

    // Act: fill Title and select Priority
    await page.getByLabel('Title').fill('Test Task');
    // Priority is a select with options Low/Medium/High
    await page.getByLabel('Priority').selectOption('High');

    // Submit the form
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Assert: modal should automatically close
    await expect(modal).toBeHidden();

    // Assert: newly created task should be visible in the dashboard task list
    await expect(page.getByRole('heading', { name: 'Test Task' })).toBeVisible();

    // Assert: success Toast notification appears on screen
    // Typical text might include "created", "success", or "Successfully"
    await expect(page.getByText(/(created|successfully|success)/i)).toBeVisible();
  });
});