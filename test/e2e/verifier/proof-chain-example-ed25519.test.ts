import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import multipleProofsVerificationSteps from '../../assertions/verification-steps-v3-multiple-proofs';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixture from '../../fixtures/v3/proof-chain-example-ed25519.json';
import fixtureIssuerProfile from '../../assertions/v3.0-issuer-profile.json';

describe('proof chain example', function () {
  let instance;
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }

          if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
            return JSON.stringify({ didDocument });
          }
        },
        lookForTx: () => ({
          remoteHash: '8303d22a9f391f0ac7deb0cd2e19cf2d582f6c93c8ddbb88bfae241041b5f951',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-05-03T17:24:07.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        })
      };
    });
    instance = new Certificate(fixture as any);
    await instance.init();
    result = await instance.verify();
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('creates the valid verification process', function () {
    expect(instance.verificationSteps).toEqual(multipleProofsVerificationSteps);
  });

  it('verifies successfully', function () {
    expect(result.status).toBe('success');
  });

  it('returns the expected verification message', function () {
    expect(result.message).toEqual({
      description: 'All the signatures of this certificate have successfully verified.',
      label: 'Verified'
    });
  });

  describe('when the verifier\'s proofPurpose does not match the document\'s proof purpose', function () {
    it('should fail verification', async function () {
      const certificate = new Certificate(fixture as any, { proofPurpose: 'authentication' });
      await certificate.init();
      const result = await certificate.verify();

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('The document\'s Ed25519Signature2020 signature could not be confirmed: Did not verify any proofs; insufficient proofs matched the acceptable suite(s) and required purpose(s).');
    });
  });
});
