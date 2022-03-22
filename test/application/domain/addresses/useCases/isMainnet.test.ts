import domain from '../../../../../src/domain';

describe('addresses domain is mainnet test suite', function () {
  describe('given bitcoinAddress is a mainnet address', function () {
    it('should return true', function () {
      const assertion = '1234567890abcdef';
      const result = domain.addresses.isMainnet(assertion);
      expect(result).toBe(true);
    });
  });

  describe('given bitcoinAddress is not a mainnet address', function () {
    it('should return false', function () {
      const assertion = '234567890abcdef';
      const result = domain.addresses.isMainnet(assertion);
      expect(result).toBe(false);
    });
  });
});
