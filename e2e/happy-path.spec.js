const { test, expect } = require('@playwright/test');

test('happy path: register -> create project -> create test case -> create run -> execute -> log bug -> export', async ({ page }) => {
  const email = `e2e-${Date.now()}@test.com`;

  // 1. Register
  await page.goto('/register');
  await page.fill('input[name="name"]', 'E2E User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // 2. Create project
  await page.waitForURL('**/projects');
  await page.waitForSelector('text=Projects');

  await page.click('text=New project');
  await page.fill('input[name="name"]', 'E2E Project');
  await page.fill('input[name="key"]', 'E2E');
  await page.click('button:has-text("Create")');
  await page.waitForTimeout(500);

  // Select the project in sidebar
  await page.selectOption('select', { label: /E2E/ });
  await page.waitForTimeout(500);

  // 3. Navigate to test cases and create one
  await page.click('text=Test cases');
  await page.waitForSelector('text=Test cases');
  await page.click('text=New test case');
  await page.fill('input[name="title"]', 'Login flow works');
  await page.fill('textarea[name="preconditions"]', 'User is on login page');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(500);

  // 4. Navigate to test runs and create one
  await page.click('text=Test runs');
  await page.waitForSelector('text=Test runs');
  await page.click('text=New run');
  await page.fill('input[placeholder]', 'E2E Smoke Run');
  await page.waitForTimeout(300);

  // Select the test case checkbox
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(500);

  // 5. Execute the run
  await page.click('text=Execute');
  await page.waitForTimeout(1000);

  // Click the first test case in the sidebar
  const caseButton = page.locator('button').filter({ hasText: 'Login flow works' }).first();
  await caseButton.click();
  await page.waitForTimeout(300);

  // Mark as pass
  await page.click('button:has-text("Pass")');
  await page.waitForTimeout(300);

  // 6. Log a bug
  await page.click('button:has-text("Log bug")');
  await page.waitForTimeout(500);

  await page.fill('input[name="title"]', 'Login button unresponsive');
  await page.fill('textarea[name="description"]', 'The login button does not respond after entering credentials');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(500);

  // 7. Navigate to bugs page
  await page.click('text=Bugs');
  await page.waitForSelector('text=Bugs');
  await page.waitForTimeout(500);

  // Verify bug appears
  const bugRow = page.locator('text=Login button unresponsive');
  await expect(bugRow).toBeVisible();

  // 8. Export the bug report
  await page.click('text=Export report');
  await page.waitForTimeout(1000);
});
