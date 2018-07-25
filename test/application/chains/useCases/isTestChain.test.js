import domain from '../../../../src/domain';
import { BLOCKCHAINS } from '../../../../src';

describe('domain chains isTestChain use case test suite', () => {
  describe('given it is called with a chain parameter', () => {
    describe('given the chain does not exist', () => {
      it('should return null', () => {
        const assertionInvalidChain = 'invalid-chain';
        const result = domain.chains.isTestChain(assertionInvalidChain);
        expect(result).toBe(null);
      });
    });

    describe('given the chain parameter is passed as a string and is a valid test chain', () => {
      it('should return true', () => {
        const assertionTestChain = BLOCKCHAINS.mocknet.code;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(true);
      });
    });

    describe('given the chain is passed as an object and is a valid test chain', () => {
      it('should return true', () => {
        const assertionTestChain = BLOCKCHAINS.mocknet;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(true);
      });
    });

    describe('given the chain is a valid main chain', () => {
      it('should return false', () => {
        const assertionTestChain = BLOCKCHAINS.bitcoin;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(false);
      });
    });

    describe('given the chain is null', () => {
      it('should return null', () => {
        const result = domain.chains.isTestChain(null);
        expect(result).toBe(null);
      });
    });
  });

  describe('given it is not called with a chain parameter', () => {
    it('should return null', () => {
      const result = domain.chains.isTestChain();
      expect(result).toBe(null);
    });
  });
});
