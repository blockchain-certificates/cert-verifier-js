import isTransactionIdValid from '../../../src/inspectors/isTransactionIdValid';

describe('Inspectors test suite', function () {
  describe('isTransactionIdValid method', function () {
    const errorMessage = 'Cannot verify this certificate without a transaction ID to compare against.';

    describe('given transactionId is a string with characters', function () {
      it('should return the transactionId', function () {
        const transactionIdFixture = 'transaction-id';
        const result = isTransactionIdValid(transactionIdFixture);
        expect(result).toBe(transactionIdFixture);
      });
    });

    describe('given transactionId is not a string', function () {
      it('throw an error', function () {
        const transactionIdFixture = 1;
        expect(() => {
          isTransactionIdValid(transactionIdFixture);
        }).toThrow(errorMessage);
      });
    });

    describe('given transactionId is an empty string', function () {
      it('throw an error', function () {
        const transactionIdFixture = '';
        expect(() => {
          isTransactionIdValid(transactionIdFixture);
        }).toThrow(errorMessage);
      });
    });
  });
});
