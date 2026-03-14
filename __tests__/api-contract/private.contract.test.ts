import { API_CONTRACT_ENV } from '@/test-utils/api-contract/env';
import { createAuthenticatedApiContractHttpClient } from '@/test-utils/api-contract/http';
import { privateApiContractCases } from '@/test-utils/api-contract/manifest.private';
import { ApiContractPreconditionError, runApiContractCase } from '@/test-utils/api-contract/runner';
import type { ApiContractContext } from '@/test-utils/api-contract/types';
import type { AxiosInstance } from 'axios';

const shouldRunPrivateContracts =
  API_CONTRACT_ENV.enabled &&
  Boolean(
    API_CONTRACT_ENV.bearerToken ||
      (API_CONTRACT_ENV.authUsername && API_CONTRACT_ENV.authPassword)
  );
const describePrivateContracts = shouldRunPrivateContracts ? describe : describe.skip;

describePrivateContracts('API contract - private read-only routes', () => {
  jest.setTimeout(120000);

  const context: ApiContractContext = {
    responses: {},
  };

  let httpClient: AxiosInstance;

  beforeAll(async () => {
    httpClient = await createAuthenticatedApiContractHttpClient({
      baseUrl: API_CONTRACT_ENV.baseUrl,
      timeoutMs: API_CONTRACT_ENV.timeoutMs,
      bearerToken: API_CONTRACT_ENV.bearerToken,
      authUsername: API_CONTRACT_ENV.authUsername,
      authPassword: API_CONTRACT_ENV.authPassword,
    });
  });

  for (const contractCase of privateApiContractCases) {
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
