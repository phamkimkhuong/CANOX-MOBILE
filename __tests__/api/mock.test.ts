import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../setup/server';

describe('MSW API Mocking', () => {

  it('should receive mock data from msw server', async () => {
    // 1. Phục kích một request tạm thời để test
    server.use(
      http.get(`http://app.test/test-mock`, () => {
        return HttpResponse.json({ message: 'Hello from MSW' }, { status: 200 });
      })
    );

    // 2. Kích hoạt request thực tế thông qua axios
    const response = await axios.get('http://app.test/test-mock');
    expect(response.data.message).toBe('Hello from MSW');
  });
});
