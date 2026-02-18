import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('BasketballHub Basic Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check if page has loaded
    await expect(page).toHaveTitle(/Create Next App/);
  });

  test('homepage has correct heading', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for the heading content
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('To get started, edit the page.tsx file.');
  });

  test('homepage has links to external resources', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for the Templates link
    const templatesLink = page.getByRole('link', { name: 'Templates' });
    await expect(templatesLink).toBeVisible();
    await expect(templatesLink).toHaveAttribute('href', 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app');

    // Check for the Learning link
    const learningLink = page.getByRole('link', { name: 'Learning' });
    await expect(learningLink).toBeVisible();
    await expect(learningLink).toHaveAttribute('href', 'https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app');
  });

  test('homepage has action buttons', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for Deploy Now button
    const deployButton = page.getByRole('link', { name: 'Deploy Now' });
    await expect(deployButton).toBeVisible();
    await expect(deployButton).toHaveAttribute('href', 'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app');

    // Check for Documentation button
    const docButton = page.getByRole('link', { name: 'Documentation' });
    await expect(docButton).toBeVisible();
    await expect(docButton).toHaveAttribute('href', 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app');
  });

  test('page is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Content should still be visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('page has no console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });

    await page.goto(BASE_URL);

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});