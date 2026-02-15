import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('BasketballConnect Website Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Create Next App/);
    
    // Check if main content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display correct heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('To get started, edit the page.tsx file.');
  });

  test('should have functional navigation links', async ({ page }) => {
    // Test Templates link
    const templatesLink = page.getByRole('link', { name: 'Templates' });
    await expect(templatesLink).toBeVisible();
    await expect(templatesLink).toHaveAttribute('href', /vercel\.com\/templates/);
    
    // Test Learning link
    const learningLink = page.getByRole('link', { name: 'Learning' });
    await expect(learningLink).toBeVisible();
    await expect(learningLink).toHaveAttribute('href', /nextjs\.org\/learn/);
  });

  test('should have action buttons', async ({ page }) => {
    // Test Deploy Now button
    const deployButton = page.getByRole('link', { name: /Deploy Now/i });
    await expect(deployButton).toBeVisible();
    await expect(deployButton).toHaveAttribute('href', /vercel\.com\/new/);
    
    // Test Documentation button
    const docButton = page.getByRole('link', { name: 'Documentation' });
    await expect(docButton).toBeVisible();
    await expect(docButton).toHaveAttribute('href', /nextjs\.org\/docs/);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(heading).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(heading).toBeVisible();
  });

  test('should have no JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(errors).toHaveLength(0);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/);
  });

  test('should have Next.js logo', async ({ page }) => {
    const nextLogo = page.locator('img[alt="Next.js logo"]');
    await expect(nextLogo).toBeVisible();
  });

  test('should have Vercel logo in deploy button', async ({ page }) => {
    const vercelLogo = page.locator('img[alt="Vercel logomark"]');
    await expect(vercelLogo).toBeVisible();
  });

  test('should have correct color scheme support', async ({ page }) => {
    // Check for dark mode classes
    const htmlElement = page.locator('html');
    const htmlClass = await htmlElement.getAttribute('class');
    expect(htmlClass).toContain('dark');
  });
});