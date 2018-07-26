import domain from '../../../../../src/domain';

describe('addresses domain is mainnet test suite', () => {
  describe('given bitcoinAddress is a mainnet address', () => {
    it('should return true', () => {
      const assertion = '1234567890abcdef';
      const result = domain.addresses.isMainnet(assertion);
      expect(result).toBe(true);
    });
  });

  describe('given bitcoinAddress is not a mainnet address', () => {
    it('should return false', () => {
      const assertion = '234567890abcdef';
      const result = domain.addresses.isMainnet(assertion);
      expect(result).toBe(false);
    });
  });
});
