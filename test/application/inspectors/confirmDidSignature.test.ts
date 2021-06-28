import confirmDidSignature from '../../../src/inspectors/confirmDidSignature';
import didDocument from '../../assertions/ion-did-document.json';
import blockcertsV3WithDid from '../../fixtures/v3/blockcerts-3.0-beta-did.json';

describe('confirmDidSignature inspector test suite', function () {
  describe('given the issuing address matches the public key mapped to the proof', function () {
    it('should return true', function () {
      const didVerification = confirmDidSignature(didDocument as any, blockcertsV3WithDid.proof, 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
      expect(didVerification).toBe(true);
    });
  });

  describe('given the DID document specified does not match the verification method', function () {
    it('should throw', function () {
      const proof = JSON.parse(JSON.stringify(blockcertsV3WithDid.proof));
      proof.verificationMethod = 'did:example:1234567890';
      expect(() => {
        confirmDidSignature(didDocument as any, proof, 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
      }).toThrow('Issuer identity mismatch - the identity document provided by the issuer does not match the verification method');
    });
  });

  describe('given the DID document specified does not reference the verification method', function () {
    it('should throw', function () {
      const proof = JSON.parse(JSON.stringify(blockcertsV3WithDid.proof));
      proof.verificationMethod = blockcertsV3WithDid.proof.verificationMethod.split('#')[0] + '#key-2';
      expect(() => {
        confirmDidSignature(didDocument as any, proof, 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
      }).toThrow('Issuer identity mismatch - the identity document provided by the issuer does not reference the verification method');
    });
  });

  describe('given the issuing address does not the public key mapped to the proof', function () {
    it('should throw', function () {
      expect(() => {
        confirmDidSignature(didDocument as any, blockcertsV3WithDid.proof, 'n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4');
      }).toThrow('Issuer identity mismatch - the provided verification method does not match the issuer identity');
    });
  });
});
