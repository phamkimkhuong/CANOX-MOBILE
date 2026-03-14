import { API_CONTRACT_ENV } from '@/test-utils/api-contract/env';
import { createApiContractHttpClient } from '@/test-utils/api-contract/http';
import { authApiContractCases } from '@/test-utils/api-contract/manifest.auth';
import { ApiContractPreconditionError, runApiContractCase } from '@/test-utils/api-contract/runner';
import type { ApiContractContext } from '@/test-utils/api-contract/types';

const shouldRunAuthContracts =
  API_CONTRACT_ENV.enabled &&
  Boolean(API_CONTRACT_ENV.authUsername) &&
  Boolean(API_CONTRACT_ENV.authPassword);

const describeAuthContracts = shouldRunAuthContracts ? describe : describe.skip;

describeAuthContracts('API contract - auth routes', () => {
  jest.setTimeout(120000);

  const context: ApiContractContext = {
    responses: {},
  };

  const httpClient = createApiContractHttpClient({
    baseUrl: API_CONTRACT_ENV.baseUrl,
    timeoutMs: API_CONTRACT_ENV.timeoutMs,
  });

  for (const contractCase of authApiContractCases) {
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
