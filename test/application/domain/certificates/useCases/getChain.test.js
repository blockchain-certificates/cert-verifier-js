import domain from '../../../../../src/domain/index';
import { BLOCKCHAINS } from '../../../../../src/index';

describe('domain certificates get chain use case test suite', function () {
  describe('given it is called with a signature with anchors', function () {
    describe('given the first anchor has a chain property', function () {
      const addressFixture = '';
      const signatureFixture = {
        'anchors': [{
          'sourceId': '0xa12c498c8fcf59ee2fe785c94c38be4797fb027e6450439a7ef30ad61d7616d3',
          'type': 'ETHData',
          'chain': 'ethereumMainnet'
        }]
      };
      const result = domain.certificates.getChain(addressFixture, signatureFixture);
      const chainAssertion = BLOCKCHAINS.ethmain;

      it('should return the correct chain object', function () {
        expect(result).toEqual(chainAssertion);
      });
    });

    describe('given the first anchor does not have a chain property', function () {
      let addressFixture = '3608e5e893a4edb8634e79b43ceae4bd30153b80a7e91e3b9d65b1bd16485433';
      let signatureFixture = {
        'anchors': [{
          'type': 'BTCOpReturn',
          'sourceId': '3608e5e893a4edb8634e79b43ceae4bd30153b80a7e91e3b9d65b1bd16485433'
        }]
      };

      const result = domain.certificates.getChain(addressFixture, signatureFixture);
      const chainAssertion = BLOCKCHAINS.testnet;

      it('should return the correct chain object', function () {
        expect(result).toEqual(chainAssertion);
      });
    });
  });

  describe('given it is called without a signature', function () {
    const addressFixture = '1234567890abcdefghij';
    const result = domain.certificates.getChain(addressFixture);
    const assertion = BLOCKCHAINS.bitcoin;

    it('should return the correct the chain object', function () {
      expect(result).toEqual(assertion);
    });
  });
});
