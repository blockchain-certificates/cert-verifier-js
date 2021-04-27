import { IssuerPublicKeyList } from '../../../src/models/Issuer';
import { ensureValidIssuingKey } from '../../../src/inspectors';

describe('ensureValidIssuingKey inspector test suite', function () {
  describe('given the transaction key is listed in the issuer key map and the transaction is valid', function () {
    it('should not throw', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).not.toThrow();
    });
  });

  describe('given the transaction key is not listed in the issuer key map', function () {
    it('should throw the expected error', function () {
      const fixtureTransactionAddress = 'nottestkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        testkey: {
          publicKey: 'testkey',
          created: new Date('2021-04-01T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The address used to issue this Blockcerts does not belong to the claimed issuer.');
    });
  });

  describe('given the issuance occurred before the issuer key was created', function () {
    it('should throw the expected error', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-03-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The specified issuing address was created after the transaction occurred.');
    });
  });

  describe('given the issuance occurred before the issuer key was created', function () {
    it('should throw the expected error', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-03-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The specified issuing address was created after the transaction occurred.');
    });
  });

  describe('given the issuance occurred before the issuer key was revoked', function () {
    it('should not throw', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime(),
          revoked: new Date('2021-04-14T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-13T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).not.toThrow();
    });
  });

  describe('given the issuance occurred after the issuer key was revoked', function () {
    it('should throw the expected error', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime(),
          revoked: new Date('2021-04-14T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The specified issuing address was revoked by the issuer before the transaction occurred.');
    });
  });

  describe('given the issuance occurred before the issuer key expired', function () {
    it('should not throw', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime(),
          expires: new Date('2021-04-14T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-13T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).not.toThrow();
    });
  });

  describe('given the issuance occurred after the issuer key expired', function () {
    it('should throw the expected error', function () {
      const fixtureTransactionAddress = 'testkey';
      const fixtureKeyMap: IssuerPublicKeyList = {
        [fixtureTransactionAddress]: {
          publicKey: fixtureTransactionAddress,
          created: new Date('2021-04-01T00:00:00Z').getTime(),
          expires: new Date('2021-04-14T00:00:00Z').getTime()
        }
      };
      const fixtureTransactionTime = '2021-04-27T00:00:00Z';

      expect(() => {
        ensureValidIssuingKey(fixtureKeyMap, fixtureTransactionAddress, fixtureTransactionTime);
      }).toThrow('The specified issuing address expired before the transaction occurred.');
    });
  });
});
