import domain from '../../../../../src/domain/index';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';

describe('domain certificates get chain use case test suite', function () {
  describe('given it is called with a signature with anchors', function () {
    describe('given the first anchor has a chain property', function () {
      const addressFixture = '';
      const signatureFixture = {
        anchors: [{
          sourceId: '0xa12c498c8fcf59ee2fe785c94c38be4797fb027e6450439a7ef30ad61d7616d3',
          type: 'ETHData',
          chain: 'ethereumMainnet'
        }]
      };

      describe('given the chain is found in BLOCKCHAINS', function () {
        it('should return the correct chain object', function () {
          const result = domain.certificates.getChain(addressFixture, signatureFixture);
          const chainAssertion = BLOCKCHAINS.ethmain;
          expect(result).toEqual(chainAssertion);
        });
      });

      describe('given the chain is not found in BLOCKCHAINS', function () {
        it('should throw an error', function () {
          signatureFixture.anchors[0].chain = 'wrong-chain';
          expect(() => {
            domain.certificates.getChain(addressFixture, signatureFixture);
          }).toThrow('Didn\'t recognize chain value');
        });
      });
    });

    describe('given the first anchor does not have a chain property', function () {
      it('should return the correct chain object', function () {
        const addressFixture = '3608e5e893a4edb8634e79b43ceae4bd30153b80a7e91e3b9d65b1bd16485433';
        const signatureFixture = {
          anchors: [{
            type: 'BTCOpReturn',
            sourceId: '3608e5e893a4edb8634e79b43ceae4bd30153b80a7e91e3b9d65b1bd16485433'
          }]
        };

        const result = domain.certificates.getChain(addressFixture, signatureFixture);
        const chainAssertion = BLOCKCHAINS.bitcoin;
        expect(result).toEqual(chainAssertion);
      });
    });
  });

  describe('given it is called without a signature', function () {
    const addressFixture = '1234567890abcdefghij';
    const result = (domain.certificates as any).getChain(addressFixture);
    const assertion = BLOCKCHAINS.bitcoin;

    it('should return the correct the chain object', function () {
      expect(result).toEqual(assertion);
    });
  });
});
