import domain from '../../../../../src/domain/index';

describe('domain certificates get transaction id use case test suite', function () {
  describe('given it is called with a valid certificate receipt', function () {
    it('should return a transaction id', function () {
      const receiptFixture = {
        anchors: [{
          sourceId: 'source-id-assertion'
        }]
      };
      expect(domain.certificates.getTransactionId(receiptFixture)).toBe('source-id-assertion');
    });
  });

  describe('given it is called with an invalid certificate receipt', function () {
    it('should throw an error', function () {
      expect(function () {
        domain.certificates.getTransactionId(null);
      }).toThrowError('Cannot verify this certificate without a transaction ID to compare against.');
    });
  });
});
