import { describe, it, expect, vi } from 'vitest';
import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/cert-rl-status-list-2021.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

// vi.mock is hoisted so we need to define the modified issuer profile in the top level scope
const modifiedIssuerProfile = JSON.parse(JSON.stringify(fixtureIssuerProfile));
const verificationMethod = fixture.proof.verificationMethod;
const publicKeys = modifiedIssuerProfile.verificationMethod.filter((key) => key.id !== verificationMethod);
modifiedIssuerProfile.verificationMethod = publicKeys;

describe('Proof verification method is not referenced in issuer profile test suite', function () {
  it('Should fail when init with helpful error message', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(modifiedIssuerProfile);
          }

          console.log('url response not mocked', url);
        }
      };
    });

    // The error at test is expected to occur when the MerkleProof2019 is part of a multiple proof document
    // as on init we will try and retrieve the MerkleProof2019's issuer profile to get the verification method
    // The added proof is a dummy as we will not get to verification stage
    const modifiedFixture = JSON.parse(JSON.stringify(fixture));
    const proofs = [
      {
        type: 'EcdsaSecp256k1Signature2019',
        proofValue: '0x1',
        verificationMethod: 'did:example:0x123456789',
        created: '2023-03-30T15:08:26Z',
        proofPurpose: 'assertionMethod'
      },
      modifiedFixture.proof
    ];
    modifiedFixture.proof = proofs;

    const certificate = new Certificate(modifiedFixture);

    await expect(async () => {
      await certificate.init();
    }).rejects.toThrow('Issuer identity mismatch - The identity document provided by the issuer does not reference the verification method');
    vi.restoreAllMocks();
  });
});
