import { rest } from 'msw';
import { server } from '../setup/server';
import { apiClient } from '@/services/api/client';

describe('MSW Setup', () => {
  beforeAll(() => {
    apiClient.defaults.baseURL = 'http://app.test';
  });

  it('intercepts requests successfully', async () => {
    server.use(
      rest.get('http://app.test/public/test', (req, res, ctx) => {
        return res(ctx.json({ success: true }));
      })
    );

    const response = await apiClient.get('/public/test');
    expect(response.data.success).toBe(true);
  });
});
