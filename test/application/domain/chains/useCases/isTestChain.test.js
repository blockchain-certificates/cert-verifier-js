import domain from '../../../../../src/domain/index';
import { BLOCKCHAINS } from '../../../../../src/index';

describe('domain chains isTestChain use case test suite', function () {
  describe('given it is called with a chain parameter', function () {
    describe('given the chain does not exist', function () {
      it('should return null', function () {
        const assertionInvalidChain = 'invalid-chain';
        const result = domain.chains.isTestChain(assertionInvalidChain);
        expect(result).toBe(null);
      });
    });

    describe('given the chain parameter is passed as a string and is a valid test chain', function () {
      it('should return true', function () {
        const assertionTestChain = BLOCKCHAINS.mocknet.code;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(true);
      });
    });

    describe('given the chain is passed as an object and is a valid test chain', function () {
      it('should return true', function () {
        const assertionTestChain = BLOCKCHAINS.mocknet;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(true);
      });
    });

    describe('given the chain is a valid main chain', function () {
      it('should return false', function () {
        const assertionTestChain = BLOCKCHAINS.bitcoin;
        const result = domain.chains.isTestChain(assertionTestChain);
        expect(result).toBe(false);
      });
    });

    describe('given the chain is null', function () {
      it('should return null', function () {
        const result = domain.chains.isTestChain(null);
        expect(result).toBe(null);
      });
    });
  });

  describe('given it is not called with a chain parameter', function () {
    it('should return null', function () {
      const result = domain.chains.isTestChain();
      expect(result).toBe(null);
    });
  });
});
