import { describe, it, expect, vi } from 'vitest';
import Bbs2023 from '../../../src/suites/Bbs2023';
import type { SuiteAPI } from '../../../src/models/Suite';
import type { VCProof } from '../../../src/models/BlockcertsV3';
import type { Issuer } from '../../../src/models/Issuer';
import fixture from '../../fixtures/v3/bbs-2023-derived-credential.json';

const VERIFICATION_METHOD_ID = fixture.proof.verificationMethod;
const ISSUER_DID = fixture.issuer;

function getBaseProof (overrides: Partial<VCProof> = {}): VCProof {
  return {
    type: 'DataIntegrityProof',
    cryptosuite: 'bbs-2023',
    created: undefined,
    proofPurpose: 'assertionMethod',
    verificationMethod: VERIFICATION_METHOD_ID,
    proofValue: 'u2V0...',
    ...overrides
  } as VCProof;
}

function getBaseIssuer (overrides: Partial<Issuer> = {}): Issuer {
  return {
    id: ISSUER_DID,
    didDocument: {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: ISSUER_DID,
      verificationMethod: [{
        id: VERIFICATION_METHOD_ID,
        type: 'Multikey',
        controller: ISSUER_DID,
        publicKeyMultibase: VERIFICATION_METHOD_ID.split('#')[1]
      }],
      authentication: [VERIFICATION_METHOD_ID],
      assertionMethod: [VERIFICATION_METHOD_ID]
    } as any,
    ...overrides
  } as Issuer;
}

function getSuiteProps (overrides: Partial<SuiteAPI> = {}): SuiteAPI {
  return {
    executeStep: async (step, action) => await action(),
    document: fixture as any,
    proof: getBaseProof(),
    issuer: getBaseIssuer(),
    ...overrides
  } as SuiteAPI;
}

describe('Bbs2023 suite test suite', function () {
  describe('constructor / validateProofType', function () {
    it('should not throw when the proof is a DataIntegrityProof with the expected cryptosuite', function () {
      expect(() => new Bbs2023(getSuiteProps())).not.toThrow();
    });

    it('should throw when the proof is a DataIntegrityProof without a cryptosuite', function () {
      const props = getSuiteProps({ proof: getBaseProof({ cryptosuite: undefined }) });
      expect(() => new Bbs2023(props)).toThrow('Malformed proof passed. With DataIntegrityProof a cryptosuite must be defined. Expected: bbs-2023');
    });

    it('should throw when the proof is a DataIntegrityProof with an incompatible cryptosuite', function () {
      const props = getSuiteProps({ proof: getBaseProof({ cryptosuite: 'ecdsa-sd-2023' }) });
      expect(() => new Bbs2023(props)).toThrow('Incompatible proof cryptosuite passed. Expected: bbs-2023, Got: ecdsa-sd-2023');
    });

    it('should not throw when the proof type directly matches the suite type', function () {
      const props = getSuiteProps({ proof: getBaseProof({ type: 'Bbs2023', cryptosuite: undefined }) });
      expect(() => new Bbs2023(props)).not.toThrow();
    });

    it('should throw when the proof type is neither DataIntegrityProof nor the suite type', function () {
      const props = getSuiteProps({ proof: getBaseProof({ type: 'Ed25519Signature2020', cryptosuite: undefined }) });
      expect(() => new Bbs2023(props)).toThrow('Incompatible proof type passed. Expected: Bbs2023, Got: Ed25519Signature2020');
    });
  });

  describe('verifyProof', function () {
    it('should log an error and return without throwing when a verification step is not implemented', async function () {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const suite = new Bbs2023(getSuiteProps());
      (suite as any).verificationProcess = ['notImplementedStep'];
      await expect(suite.verifyProof()).resolves.toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith('verification logic for', 'notImplementedStep', 'not implemented');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('executeStep', function () {
    it('should throw when not overwritten by the injecting Verifier', async function () {
      const props = getSuiteProps();
      delete (props as any).executeStep;
      const suite = new Bbs2023(props);
      await expect(suite.executeStep('someStep', async () => {}, suite.type))
        .rejects.toThrow('doAction method needs to be overwritten by injecting from CVJS');
    });
  });

  describe('getIssuerProfileDomain', function () {
    it('should return the hostname when the issuer profile url is a valid URL', function () {
      const suite = new Bbs2023(getSuiteProps({ issuer: getBaseIssuer({ id: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json' }) }));
      expect(suite.getIssuerProfileDomain()).toBe('www.blockcerts.org');
    });

    it('should return an empty string when the issuer profile url is not a valid URL', function () {
      const suite = new Bbs2023(getSuiteProps({ issuer: getBaseIssuer({ id: ISSUER_DID }) }));
      expect(suite.getIssuerProfileDomain()).toBe('');
    });
  });

  describe('getIssuerName', function () {
    it('should return the issuer name when set', function () {
      const suite = new Bbs2023(getSuiteProps({ issuer: getBaseIssuer({ name: 'Test Issuer' }) }));
      expect(suite.getIssuerName()).toBe('Test Issuer');
    });

    it('should return an empty string when the issuer has no name', function () {
      const suite = new Bbs2023(getSuiteProps());
      expect(suite.getIssuerName()).toBe('');
    });
  });

  describe('getTargetVerificationMethodContainer (private)', function () {
    it('should return the didDocument when it contains the matching verification method', function () {
      const suite = new Bbs2023(getSuiteProps());
      const container = (suite as any).getTargetVerificationMethodContainer();
      expect(container).toBe((suite as any).issuer.didDocument);
    });

    it('should fall back to the issuer profile when the didDocument does not contain the matching verification method', function () {
      const issuer = getBaseIssuer();
      issuer.didDocument.verificationMethod[0].id = 'did:key:someOtherKey#someOtherKey';
      issuer.name = 'Fallback Issuer';
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      const container = (suite as any).getTargetVerificationMethodContainer();
      expect(container.name).toBe('Fallback Issuer');
      expect(container.didDocument).toBeUndefined();
    });

    it('should fall back to the issuer profile when there is no didDocument at all', function () {
      const issuer = getBaseIssuer({ name: 'No Did Document Issuer' });
      delete issuer.didDocument;
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      const container = (suite as any).getTargetVerificationMethodContainer();
      expect(container.name).toBe('No Did Document Issuer');
      expect(container.didDocument).toBeUndefined();
    });
  });

  describe('retrieveVerificationMethodPublicKey (private)', function () {
    it('should throw when the verification method cannot be derived', async function () {
      const issuer = getBaseIssuer();
      issuer.didDocument.verificationMethod[0].id = 'did:key:someOtherKey#someOtherKey';
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      await expect((suite as any).retrieveVerificationMethodPublicKey())
        .rejects.toThrow('Could not derive the verification key');
    });

    it('should throw when the verification method has been revoked', async function () {
      const issuer = getBaseIssuer();
      (issuer.didDocument.verificationMethod[0] as any).revoked = '2023-04-05T18:45:30Z';
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      await expect((suite as any).retrieveVerificationMethodPublicKey())
        .rejects.toThrow('The verification key has been revoked');
    });

    it('should set the publicKey from the retrieved verification method on success', async function () {
      const suite = new Bbs2023(getSuiteProps());
      await (suite as any).retrieveVerificationMethodPublicKey();
      expect(suite.publicKey).toBe(VERIFICATION_METHOD_ID.split('#')[1]);
      expect(suite.getIssuerPublicKey()).toBe(VERIFICATION_METHOD_ID.split('#')[1]);
    });
  });

  describe('ensureVerificationMethodValidity (private)', function () {
    it('should throw when the verification method has expired', async function () {
      const issuer = getBaseIssuer();
      (issuer.didDocument.verificationMethod[0] as any).expires = '2023-04-05T18:45:30Z';
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      (suite as any).verificationMethod = issuer.didDocument.verificationMethod[0];
      await expect((suite as any).ensureVerificationMethodValidity())
        .rejects.toThrow('The verification key has expired');
    });

    it('should throw when the verification method has been revoked', async function () {
      const issuer = getBaseIssuer();
      (issuer.didDocument.verificationMethod[0] as any).revoked = '2023-04-05T18:45:30Z';
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      (suite as any).verificationMethod = issuer.didDocument.verificationMethod[0];
      await expect((suite as any).ensureVerificationMethodValidity())
        .rejects.toThrow('The verification key has been revoked');
    });

    it('should not throw when the verification method is valid', async function () {
      const issuer = getBaseIssuer();
      const suite = new Bbs2023(getSuiteProps({ issuer }));
      (suite as any).verificationMethod = issuer.didDocument.verificationMethod[0];
      await expect((suite as any).ensureVerificationMethodValidity()).resolves.toBeUndefined();
    });
  });

  describe('checkDocumentSignature (private)', function () {
    it('should default an unset challenge to an empty string when the proof purpose is authentication', async function () {
      const suite = new Bbs2023(getSuiteProps({ proofPurpose: 'authentication' }));
      (suite as any).verificationKey = getBaseIssuer().didDocument.verificationMethod[0];
      await (suite as any).checkDocumentSignature().catch(() => {});
      expect((suite as any).proof.challenge).toBe('');
    });
  });
});
