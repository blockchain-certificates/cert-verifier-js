import { BLOCKCHAINS } from '../../../src/constants';
import { isTestChain } from '../../../src/constants/blockchains';

describe('isTestChain method', function () {
  describe('given the chain is bitcoin', function () {
    it('should return false', function () {
      expect(isTestChain(BLOCKCHAINS.bitcoin.code)).toEqual(false);
    });
  });

  describe('given the chain is ethmain', function () {
    it('should return false', function () {
      expect(isTestChain(BLOCKCHAINS.ethmain.code)).toEqual(false);
    });
  });

  describe('given the chain is mocknet', function () {
    it('should return true', function () {
      expect(isTestChain(BLOCKCHAINS.mocknet.code)).toEqual(true);
    });
  });

  describe('given the chain is ethropst', function () {
    it('should return true', function () {
      expect(isTestChain(BLOCKCHAINS.ethropst.code)).toEqual(true);
    });
  });
});
