import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:3000';

test.describe('[US-02] Login Validation and Error Handling', () => {
  test('should present login interface with empty fields on first load [AC_01]', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('should block empty submission with local validation warnings [AC_02]', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    // Ensure fields start empty
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');

    // Attempt to submit without any values
    await page.getByRole('button', { name: 'Login' }).click();

    // Remains on login page (no navigation)
    await expect(page).toHaveURL(/\/login$/);

    // Focus should move to the first invalid control (email)
    await expect(emailInput).toBeFocused();

    // Native constraint validation should flag both inputs as missing values
    const emailValidity = await emailInput.evaluate((el: HTMLInputElement) => ({
      required: el.required,
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
    }));
    const passwordValidity = await passwordInput.evaluate((el: HTMLInputElement) => ({
      required: el.required,
      valid: el.validity.valid,
      valueMissing: el.validity.valueMissing,
    }));

    expect(emailValidity.required).toBe(true);
    expect(emailValidity.valid).toBe(false);
    expect(emailValidity.valueMissing).toBe(true);

    expect(passwordValidity.required).toBe(true);
    expect(passwordValidity.valid).toBe(false);
    expect(passwordValidity.valueMissing).toBe(true);

    // No server-side error should appear for empty submission
    await expect(page.getByText('Invalid credentials')).not.toBeVisible();
  });

  test('should display "Invalid credentials" error when credentials are incorrect [AC_03]', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
});