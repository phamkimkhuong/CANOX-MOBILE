import axios from 'axios';
import { rest } from 'msw';
import { server } from '../setup/server';

describe('MSW API Mocking', () => {

  it('should receive mock data from msw server', async () => {
    // 1. Phục kích một request tạm thời để test
    server.use(
      rest.get(`http://app.test/test-mock`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ message: 'Hello from MSW' })
        );
      })
    );

    // 2. Kích hoạt request thực tế thông qua axios
    const response = await axios.get('http://app.test/test-mock');
    expect(response.data.message).toBe('Hello from MSW');
  });
});
