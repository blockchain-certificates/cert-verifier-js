import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import EthereumSepoliaV3 from '../../fixtures/v3/ethereum-sepolia-v3.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is a valid Sepolia anchored v3 certs', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }
        },
        lookForTx: () => ({
          remoteHash: 'b2c64ed78cccda992431c265a1d0bb657e8cefd14b1ef15ceadcc697c566994f',
          issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
          time: '2022-11-02T02:33:24.000Z',
          revokedAddresses: []
        })
      };
    });
    const certificate = new Certificate(EthereumSepoliaV3);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
