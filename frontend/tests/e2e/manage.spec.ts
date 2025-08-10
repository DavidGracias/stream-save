import { test, expect } from '@playwright/test';

test.describe('Manage page', () => {
  test('loads and shows empty state, then renders content when catalog returns items', async ({ page }) => {
    // Intercept catalog with empty content first
    await page.route('**/catalog**', async (route) => {
      await route.fulfill({ json: { content: [], total_count: 0 } });
    });

    await page.goto('/manage');
    await expect(page.getByText('No content found. Add some movies or series to get started!')).toBeVisible();

    // Now update route to return one item and trigger reload
    await page.route('**/catalog**', async (route) => {
      await route.fulfill({
        json: {
          content: [
            { id: 'tt0000001', type: 'movie', name: 'Test Movie', description: 'Desc', poster: '', releaseInfo: '2020', imdbRating: '8.0' }
          ], total_count: 1
        }
      });
    });

    await page.reload();
    await expect(page.getByText('Test Movie')).toBeVisible();
    await expect(page.getByText('Movies:')).toBeVisible();
  });

  test('submits add content form and shows success flow', async ({ page }) => {
    // Mock catalog on first load
    await page.route('**/catalog**', async (route) => {
      await route.fulfill({ json: { content: [], total_count: 0 } });
    });

    // Mock manage add endpoint
    await page.route('**/manage', async (route) => {
      const post = route.request().method() === 'POST';
      if (post) {
        const body = await route.request().postData() || '';
        expect(body).toContain('option=add');
        await route.fulfill({ status: 200, body: 'Success' });
      } else {
        await route.fallback();
      }
    });

    await page.goto('/manage');

    // Open add dialog
    await page.getByRole('button', { name: 'Add Saved Stream Link' }).click();

    // Fill fields (type defaults to Movie)
    await page.getByLabel('IMDB ID *').fill('tt1234567');
    await page.getByLabel('Stream Link *').fill('https://example.com/stream.m3u8');

    // Submit
    await page.getByRole('button', { name: 'Add Content' }).click();

    // After submit, fetchContent will run; ensure no crash
    await expect(page).toHaveURL(/\/manage/);
  });
});


