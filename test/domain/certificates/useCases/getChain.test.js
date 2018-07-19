import domain from '../../../../src/domain';
import { BLOCKCHAINS } from '../../../../src';

describe('domain certificates get chain use case test suite', () => {
  describe('given it is called with a signature', () => {
    const signatureFixture = {
      anchors: [{
        chain: 'bitcoinMainnet'
      }]
    };
    const result = domain.certificates.getChain(signatureFixture);
    const assertion = BLOCKCHAINS.bitcoin;

    it('should return the correct chain object', () => {
      expect(result).toEqual(assertion);
    });
  });
});
