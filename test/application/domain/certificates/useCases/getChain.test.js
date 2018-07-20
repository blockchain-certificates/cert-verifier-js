import domain from '../../../../../src/domain/index';
import { BLOCKCHAINS } from '../../../../../src/index';

describe('domain certificates get chain use case test suite', () => {
  describe('given it is called with a signature', () => {
    const bitcoinAddress = '';
    const signatureFixture = {
      anchors: [{
        chain: 'bitcoinMainnet'
      }]
    };
    const result = domain.certificates.getChain(bitcoinAddress, signatureFixture);
    const assertion = BLOCKCHAINS.bitcoin;

    it('should return the correct chain object', () => {
      expect(result).toEqual(assertion);
    });
  });

  describe('given it is called without a signature', () => {
    const bitcoinAddress = '1234567890abcdefghij';
    const result = domain.certificates.getChain(bitcoinAddress);
    const assertion = BLOCKCHAINS.bitcoin;

    it('should return the correct the chain object', () => {
      expect(result).toEqual(assertion);
    });
  });
});
