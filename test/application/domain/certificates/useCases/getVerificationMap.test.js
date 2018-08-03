import domain from '../../../../../src/domain';
import { BLOCKCHAINS } from '../../../../../src';
import mocknetMapAssertion from './assertions/mocknetMapAssertion';
import mainnetMapAssertion from './assertions/mainnetMapAssertion';

describe('domain certificates get verification map use case test suite', function () {
  describe('given it is called with the mocknet chain', function () {
    it('should return a mocknet verification map', function () {
      const result = domain.certificates.getVerificationMap(BLOCKCHAINS.mocknet);
      expect(result).toEqual(mocknetMapAssertion);
    });
  });

  describe('given it is called with the bitcoin chain', function () {
    it('should return a mainnet verification map', function () {
      const result = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin);
      expect(result).toEqual(mainnetMapAssertion);
    });
  });

  describe('given it is called without a chain and a version', function () {
    it('should return an empty array', function () {
      const result = domain.certificates.getVerificationMap();
      expect(result).toEqual([]);
    });
  });
});
