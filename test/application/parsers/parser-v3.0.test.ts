import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import parseJSON from '../../../src/parsers';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import BlockcertsV3 from '../../fixtures/v3/testnet-v3-did.json';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import v3IssuerProfile from '../../fixtures/issuer-blockcerts.json';

const fixture = BlockcertsV3;
const assertionIssuerProfile = {
  ...v3IssuerProfile,
  didDocument
};

describe('Parser v3 test suite', function () {
  describe('given it is called with a invalid format v3 certificate data', function () {
    it('should set whether or not the certificate format is valid', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixture));
      fixtureCopy.issuer = 'not a url';
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate.isFormatValid).toBe(false);
    });
  });

  describe('given it is called with valid v3 certificate data', function () {
    let parsedCertificate;

    beforeAll(async function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          // replace some exports
          request: async function ({ url }) {
            if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
              return JSON.stringify({ didDocument });
            }

            if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
              return JSON.stringify(v3IssuerProfile);
            }
          }
        };
      });
      parsedCertificate = await parseJSON(fixture);
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    it('should set the id of the certificate object', function () {
      expect(parsedCertificate.id).toBe(fixture.id);
    });

    it('should set issuedOn of the certificate object', function () {
      expect(parsedCertificate.issuedOn).toBe(fixture.issuanceDate);
    });

    it('should retrieve the issuer profile of the certificate object', function () {
      expect(parsedCertificate.issuer).toEqual(assertionIssuerProfile);
    });

    it('should set metadataJson of the certificate object', function () {
      expect(parsedCertificate.metadataJson).toEqual(fixture.metadata);
    });

    it('should set the recipientFullName of the certificate object', function () {
      const fullNameAssertion = fixture.credentialSubject.name;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set recordLink of the certificate object', function () {
      expect(parsedCertificate.recordLink).toBe(fixture.id);
    });

    it('should return the display property', function () {
      expect(parsedCertificate.display).toEqual(fixture.display);
    });

    describe('when the expirationDate is set', function () {
      it('should set the expires property', async function () {
        const fixtureCopy = JSON.parse(JSON.stringify(fixture));
        fixtureCopy.expirationDate = '2022-04-27T00:00:00Z';
        const parsedCertificate = await parseJSON(fixtureCopy);
        expect(parsedCertificate.expires).toEqual(fixtureCopy.expirationDate);
      });
    });

    describe('when the validFrom property is set', function () {
      it('should set the validFrom property', async function () {
        const fixtureCopy = JSON.parse(JSON.stringify(fixture));
        fixtureCopy.validFrom = '2021-04-27T00:00:00Z';
        const parsedCertificate = await parseJSON(fixtureCopy);
        expect(parsedCertificate.validFrom).toBe(fixtureCopy.validFrom);
      });
    });

    describe('when the validFrom property is not set', function () {
      describe('and the proof object is an array', function () {
        it('should set the validFrom property to the created property of the first proof', async function () {
          const fixtureCopy = JSON.parse(JSON.stringify(fixture));
          delete fixtureCopy.validFrom;
          const initialProof = fixture.proof;
          fixtureCopy.proof = [initialProof, {
            type: 'MerkleProof2019',
            created: '2024-04-05T13:43:10.870521',
            proofValue: 'z4zvrPUULnHmaio37FZuwYZDyU39wMYujJCMeypmxMWhh2XoCSMSVoeVRBKeEKUVnqccnmgggyPYLx2xubmvDCP2HWMCcTCLrcpBHJMEzUiwQrixSFStZbxQq9yPVNoYysMcxinfxZTpmH1j5mmGsC2fUP1LEMruXA1fKgupM3Ea97PzUGjgDgSfZqJNKjmFMJYL5tC1R7XoRqYvpKg3NhMrFY9YtyuERDW9do92EPeSw17j5xUZLpj6uGieJVrf5ps4AScoB4tXXTm4eFi4ZkQbbbvkRmPK9bZsyKKxGQ2Bq5cfwPbvPHiaGLSHEBrAYh75so7LwoiKi1VCw7NdsybWmMUf1E547PZhbqTB5hXJD5VBYN6hpoGzc18L6boKN1oveFaHAoFrQsEjmBJ',
            proofPurpose: 'assertionMethod',
            verificationMethod: 'did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ#key-1'
          }];
          const parsedCertificate = await parseJSON(fixtureCopy);
          expect(parsedCertificate.validFrom).toBe(fixtureCopy.proof[0].created);
        });
      });

      describe('and the proof object is not an array', function () {
        it('should set the validFrom property to the created property of the proof', async function () {
          const fixtureCopy = JSON.parse(JSON.stringify(fixture));
          delete fixtureCopy.validFrom;
          const parsedCertificate = await parseJSON(fixtureCopy);
          expect(parsedCertificate.validFrom).toBe(fixture.proof.created);
        });
      });
    });

    describe('when the validUntil property is set', function () {
      it('should set the validUntil property', async function () {
        const fixtureCopy = JSON.parse(JSON.stringify(fixture));
        fixtureCopy.validUntil = '2022-04-27T00:00:00Z';
        const parsedCertificate = await parseJSON(fixtureCopy);
        expect(parsedCertificate.expires).toBe(fixtureCopy.validUntil);
      });
    });
  });
});
