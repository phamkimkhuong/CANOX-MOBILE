import { API_CONTRACT_ENV } from '@/test-utils/api-contract/env';
import { createApiContractHttpClient } from '@/test-utils/api-contract/http';
import { publicApiContractCases } from '@/test-utils/api-contract/manifest.public';
import { ApiContractPreconditionError, runApiContractCase } from '@/test-utils/api-contract/runner';
import type { ApiContractContext } from '@/test-utils/api-contract/types';

const describeApiContract = API_CONTRACT_ENV.enabled ? describe : describe.skip;

describeApiContract('API contract - public routes', () => {
  jest.setTimeout(120000);

  const context: ApiContractContext = {
    responses: {},
  };

  const httpClient = createApiContractHttpClient({
    baseUrl: API_CONTRACT_ENV.baseUrl,
    timeoutMs: API_CONTRACT_ENV.timeoutMs,
    bearerToken: API_CONTRACT_ENV.bearerToken,
  });

  for (const contractCase of publicApiContractCases) {
    const testFn = contractCase.enabled === false ? it.skip : it;
    testFn(`${contractCase.id} | ${contractCase.description}`, async () => {
      try {
        await runApiContractCase(httpClient, context, contractCase);
      } catch (error) {
        if (error instanceof ApiContractPreconditionError) {
          console.warn(`[api-contract] ${error.message}`);
          return;
        }
        throw error;
      }
    });
  }
});
