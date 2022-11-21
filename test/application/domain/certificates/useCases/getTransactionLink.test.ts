import domain from '../../../../../src/domain';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import type { ITransactionLink } from '../../../../../src/domain/certificates/useCases/getTransactionLink';

describe('domain certificates get transaction link use case test suite', function () {
  const transactionIdFixture = 'transaction-id-assertion';
  const blockchainFixture = BLOCKCHAINS.bitcoin;

  describe('given it is called with a transaction id and a chain', function () {
    let output: ITransactionLink;

    beforeEach(function () {
      output = domain.certificates.getTransactionLink(transactionIdFixture, blockchainFixture);
    });

    it('should return a transaction the tx link', function () {
      expect(output.transactionLink).toBe('https://blockchain.info/tx/transaction-id-assertion');
    });

    it('should return a transaction the rawtx link', function () {
      expect(output.rawTransactionLink).toBe('https://blockchain.info/rawtx/transaction-id-assertion');
    });
  });

  describe('given it is called without a chain', function () {
    it('should return null', function () {
      expect((domain.certificates as any).getTransactionLink(transactionIdFixture)).toBe(null);
    });
  });

  describe('given it is called without a transaction id', function () {
    it('should return null', function () {
      expect(domain.certificates.getTransactionLink('', blockchainFixture)).toBe(null);
    });
  });

  describe('given it is called without parameter', function () {
    it('should return null', function () {
      expect((domain.certificates as any).getTransactionLink()).toBe(null);
    });
  });
});
