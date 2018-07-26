import domain from '../../../../../src/domain';
import { BLOCKCHAINS } from '../../../../../src';

describe('domain certificates get transaction link use case test suite', () => {
  describe('given it is called with a transaction id and a chain', () => {
    const transactionIdFixture = 'transaction-id-assertion';
    const blockchainFixture = BLOCKCHAINS.bitcoin;

    it('should return a transaction id', () => {
      expect(domain.certificates.getTransactionLink(transactionIdFixture, blockchainFixture)).toBe('https://blockchain.info/tx/transaction-id-assertion');
    });

    describe('given it is called with getRawVersion', () => {
      expect(domain.certificates.getTransactionLink(transactionIdFixture, blockchainFixture, true)).toBe('https://blockchain.info/rawtx/transaction-id-assertion');
    });
  });

  describe('given it is called without a chain', () => {
    it('should return an empty string', () => {
      expect(domain.certificates.getTransactionLink('transaction-id-assertion')).toBe('');
    });
  });

  describe('given it is called without parameter', () => {
    it('should return an empty string', () => {
      expect(domain.certificates.getTransactionLink()).toBe('');
    });
  });
});
