import domain from '../../../../../src/domain';
import { BLOCKCHAINS } from '../../../../../src/constants';
import { CERTIFICATE_VERSIONS } from '../../../../../dist/verifier-es';

describe('Verifier domain lookForTx use case test suite', function () {
  const MOCK_TRANSACTION_ID = 'mock-transaction-id';
  let MOCK_CHAIN = BLOCKCHAINS.bitcoin.code
  const MOCK_CERTIFICATE_VERSION = CERTIFICATE_VERSIONS.V1_2;

  describe('given it is called with a transactionId, a chain and a certificateVersion', function () {
    describe('given the chain is invalid', () => {
      it('should throw an error', () => {
        MOCK_CHAIN = 'invalid-chain';
        expect(domain.verifier.lookForTx(MOCK_TRANSACTION_ID, MOCK_CHAIN, MOCK_CERTIFICATE_VERSION)).rejects.toThrow('Invalid chain; does not map to known BlockchainExplorers.');
      });
    });
  });
});
