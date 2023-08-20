import { test, expect } from '@playwright/test';

test('can create lobby', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Nickname').fill('TestUser');
  await page.getByRole('button', { name: 'Create Lobby' }).click();
  expect(page.getByText('You are: TestUser')).toBeVisible();
});
