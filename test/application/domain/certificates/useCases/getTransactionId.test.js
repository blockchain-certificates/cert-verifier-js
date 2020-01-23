import domain from '../../../../../src/domain/index';

describe('domain certificates get transaction id use case test suite', function () {
  describe('given it is called with a valid certificate receipt', function () {
    describe('when the receipt is an object', function () {
      it('should return a transaction id', function () {
        const receiptFixture = {
          anchors: [{
            sourceId: 'source-id-assertion'
          }]
        };
        expect(domain.certificates.getTransactionId(receiptFixture)).toBe('source-id-assertion');
      });
    });

    describe('when the receipt is a v3 anchor string', function () {
      it('should return the transaction id', function () {
        const receiptFixture = {
          anchors: ['blink:eth:ropsten:0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a']
        };
        expect(domain.certificates.getTransactionId(receiptFixture)).toBe('0xfaea9061b06ff532d96ad91bab89fdfab900ae7d4524161431dc88318216435a');
      });
    });
  });

  describe('given it is called with an invalid certificate receipt', function () {
    describe('when the object is null', function () {
      it('should throw an error', function () {
        expect(function () {
          domain.certificates.getTransactionId(null);
        }).toThrowError('Cannot verify this certificate without a transaction ID to compare against.');
      });
    });

    describe('when the object is undefined', function () {
      it('should throw an error', function () {
        expect(function () {
          domain.certificates.getTransactionId();
        }).toThrowError('Cannot verify this certificate without a transaction ID to compare against.');
      });
    });

    describe('when there are no anchors object', function () {
      it('should throw an error', function () {
        expect(function () {
          domain.certificates.getTransactionId({});
        }).toThrowError('Cannot verify this certificate without a transaction ID to compare against.');
      });
    });
  });
});
