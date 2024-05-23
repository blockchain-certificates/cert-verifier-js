import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import BlockcertsStatusList2021Revocation from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Revoked from '../../fixtures/v3/cert-rl-status-list-2021-revoked.json';

describe('Status List 2021 v3 suspended example', function () {
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/status-list-2021.json') {
            return JSON.stringify(BlockcertsStatusList2021Revocation);
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json') {
            return JSON.stringify(BlockcertsStatusList2021Suspension);
          }
        },
        lookForTx: () => ({
          remoteHash: '1c10497bdbc9e1812ada342c1e2a1c4d60c2f263f195116a804a98e6e8288b6c',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2023-03-30T13:13:13.000Z',
          revokedAddresses: []
        })
      };
    });

    const instance = new Certificate(StatusList2021Revoked as any);
    await instance.init();
    result = await instance.verify();
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should present the correct failure message', function () {
    expect(result.message).toBe('This certificate has been revoked by the issuer.');
  });
});
