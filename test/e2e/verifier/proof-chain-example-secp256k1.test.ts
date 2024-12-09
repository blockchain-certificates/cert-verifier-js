import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example-secp256k1.json';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('proof chain example', function () {
  let instance;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }

          if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
            return JSON.stringify({ didDocument });
          }
        },
        lookForTx: function () {
          return {
            remoteHash: '99d1c6fdb496eae6aa2e357833877ebe4187765780e43a4107fb7abd5968de78',
            issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
            time: '2022-07-15T16:03:48.000Z',
            revokedAddresses: []
          };
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('verifies as expected', async function () {
    instance = new Certificate(fixture as any);
    await instance.init();
    const result = await instance.verify();
    expect(result.message).toEqual({
      description: 'All the signatures of this certificate have successfully verified.',
      label: 'Verified'
    });
    expect(result.status).toBe('success');
  });

  describe('when the verifier\'s proofPurpose does not match the document\'s proof purpose', function () {
    it('should fail verification', async function () {
      const certificate = new Certificate(fixture as any, { proofPurpose: 'authentication' });
      await certificate.init();
      const result = await certificate.verify();

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('The document\'s EcdsaSecp256k1Signature2019 signature could not be confirmed: Did not verify any proofs; insufficient proofs matched the acceptable suite(s) and required purpose(s).');
    });
  });
});
