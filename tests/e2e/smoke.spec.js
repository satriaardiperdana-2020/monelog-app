import { expect, test } from '@playwright/test'

test('redirects an unauthenticated visitor to login', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Monelog')
  await expect(
    page.getByRole('heading', { name: 'Masuk' }),
  ).toBeVisible()
})
