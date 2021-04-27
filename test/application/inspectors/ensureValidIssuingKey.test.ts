import { IssuerPublicKeyList } from '../../../src/models/Issuer';
import { ensureValidIssuingKey } from '../../../src/inspectors';

describe('ensureValidIssuingKey inspector test suite', function () {
  describe('given the transaction key is not listed in the issuer key map', function () {
    it('should throw the expected error', function () {
      const fixtureKeyMap: IssuerPublicKeyList = {
        testkey: {
          publicKey: 'testkey',
          created: new Date('2021-01-04T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionAddress = 'nottestkey';
      const fixtureTransactionTime = '2021-27-04T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The address used to issue this Blockcerts does not belong to the claimed issuer.');
    });
  });
});
