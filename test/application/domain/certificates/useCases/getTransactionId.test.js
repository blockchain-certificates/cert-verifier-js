import domain from '../../../../../src/domain/index';

describe('domain certificates get transaction id use case test suite', () => {
  describe('given it is called with a valid certificate receipt', () => {
    it('should return a transaction id', () => {
      const receiptAssertion = {
        anchors: [{
          sourceId: 'source-id-assertion'
        }]
      };
      expect(domain.certificates.getTransactionId(receiptAssertion)).toBe('source-id-assertion');
    });
  });

  describe('given it is called with an invalid certificate receipt', () => {
    it('should throw an error', () => {
      expect(() => {
        domain.certificates.getTransactionId(null);
      }).toThrowError('Cannot verify this certificate without a transaction ID to compare against.');
    });
  });
});
