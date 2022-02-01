import confirmDidSignature from '../../../src/inspectors/confirmDidSignature';
import didDocument from '../../assertions/ion-did-document-btc-addresses.json';
import didDocumentEth from '../../fixtures/did/ion-did-document-eth-addresses.json';
import blockcertsV3WithDid from '../../fixtures/v3/blockcerts-3.0-beta-did.json';
import blockcertsV3WithDidEthRopsten from '../../fixtures/v3/blockcerts-3.0-beta-did-ethereum-ropsten.json';
import { BLOCKCHAINS } from '../../../src';

describe('confirmDidSignature inspector test suite', function () {
  describe('given the blockcerts was issued on a Bitcoin network', function () {
    describe('given the Testnet issuing address matches the public key mapped to the proof', function () {
      it('should return true', function () {
        const didVerification = confirmDidSignature({
          didDocument: didDocument as any,
          proof: blockcertsV3WithDid.proof,
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          chain: BLOCKCHAINS.testnet
        });
        expect(didVerification).toBe(true);
      });
    });

    describe('given the Mainnet issuing address matches the public key mapped to the proof', function () {
      it('should return true', function () {
        const didVerification = confirmDidSignature({
          didDocument: didDocument as any,
          proof: blockcertsV3WithDid.proof,
          issuingAddress: '127ZSsk5cWiubyDBkocJdW9dFYLN5N1jHF',
          chain: BLOCKCHAINS.bitcoin
        });
        expect(didVerification).toBe(true);
      });
    });
  });

  describe('given the blockcerts was issued on an Ethereum network', function () {
    describe('given the ropsten issuing address matches the public key mapped to the proof', function () {
      it('should return true', function () {
        const didVerification = confirmDidSignature({
          didDocument: didDocumentEth as any,
          proof: blockcertsV3WithDidEthRopsten.proof,
          issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
          chain: BLOCKCHAINS.ethropst
        });
        expect(didVerification).toBe(true);
      });
    });

    describe('given the mainnet issuing address matches the public key mapped to the proof', function () {
      it.todo('should return true'
        // no examples of ethereum mainnet issued cert with DID
      );
    });
  });

  describe('given the DID document specified does not match the verification method', function () {
    it('should throw', function () {
      const proof = JSON.parse(JSON.stringify(blockcertsV3WithDid.proof));
      proof.verificationMethod = 'did:example:1234567890';
      expect(() => {
        confirmDidSignature({
          didDocument: didDocument as any,
          proof,
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          chain: BLOCKCHAINS.testnet
        });
      }).toThrow('Issuer identity mismatch - The identity document provided by the issuer does not match the verification method');
    });
  });

  describe('given the DID document specified does not reference the verification method', function () {
    it('should throw', function () {
      const proof = JSON.parse(JSON.stringify(blockcertsV3WithDid.proof));
      proof.verificationMethod = blockcertsV3WithDid.proof.verificationMethod.split('#')[0] + '#key-2';
      expect(() => {
        confirmDidSignature({
          didDocument: didDocument as any,
          proof,
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          chain: BLOCKCHAINS.testnet
        });
      }).toThrow('Issuer identity mismatch - The identity document provided by the issuer does not reference the verification method');
    });
  });

  describe('given the issuing address does not match the public key mapped to the proof', function () {
    it('should throw', function () {
      expect(() => {
        confirmDidSignature({
          didDocument: didDocument as any,
          proof: blockcertsV3WithDid.proof,
          issuingAddress: 'n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4',
          chain: BLOCKCHAINS.testnet
        });
      }).toThrow('Issuer identity mismatch - The provided verification method does not match the issuer identity');
    });
  });
});
