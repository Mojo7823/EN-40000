import { expect, test } from '@playwright/test'

test.describe('CRA Tool navigation', () => {
  test('dashboard to document workflow navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'CRA Tool Demo Gallery' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Modal Demo' })).toBeVisible()

    await page.getByRole('link', { name: 'Cover' }).click()
    await expect(page.getByRole('heading', { name: 'Product Cover Details' })).toBeVisible()
    await page.getByRole('link', { name: 'Go to Document Preview' }).click()
    await expect(page.getByRole('heading', { name: 'Document Preview' })).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page.getByRole('heading', { name: 'CRA Tool Demo Gallery' })).toBeVisible()
  })
})
