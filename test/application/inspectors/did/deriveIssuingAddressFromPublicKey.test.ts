import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import deriveIssuingAddressFromPublicKey from '../../../../src/inspectors/did/deriveIssuingAddressFromPublicKey';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';

describe('deriveIssuingAddressFromPublicKey test suite', function () {
  let publicKey: IDidDocumentPublicKey;

  beforeEach(function () {
    publicKey = Object.assign({}, didDocument.verificationMethod[0]);
  });

  describe('given the argument chain was Bitcoin', function () {
    it('should return the address of Bitcoin Mainnet', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.bitcoin);
      expect(address).toBe('127ZSsk5cWiubyDBkocJdW9dFYLN5N1jHF');
    });
  });

  describe('given the argument chain was Mocknet', function () {
    it('should return the address of Bitcoin Mocknet', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.mocknet);
      expect(address).toBe('127ZSsk5cWiubyDBkocJdW9dFYLN5N1jHF');
    });
  });

  describe('given the argument chain was Testnet', function () {
    it('should return the address of Bitcoin Testnet', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.testnet);
      expect(address).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
    });
  });

  describe('given the argument chain was Ethmain', function () {
    it('should return the address of Ethereum', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethmain);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethropst', function () {
    it('should return the address of Ethereum', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethropst);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethrinkeby', function () {
    it('should return the address of Ethereum', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethrinkeby);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethgoerli', function () {
    it('should return the address of Ethereum', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethgoerli);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Ethsepolia', function () {
    it('should return the address of Ethereum', function () {
      const address = deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.ethsepolia);
      expect(address).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
    });
  });

  describe('given the argument chain was Regtest (Unsupported)', function () {
    it('should throw', function () {
      expect(() => {
        deriveIssuingAddressFromPublicKey(publicKey, BLOCKCHAINS.regtest);
      }).toThrow('Issuer identity mismatch - Unsupported blockchain for DID verification');
    });
  });
});
