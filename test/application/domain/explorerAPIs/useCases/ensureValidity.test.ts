import { ExplorerAPI } from '../../../../../src/certificate';
import { TransactionData } from '../../../../../src/models/TransactionData';
import ensureValidity from '../../../../../src/domain/explorerAPIs/useCases/ensureValidity';

describe('Verifier domain ensureValidity use case test suite', function () {
  describe('given at least one custom explorer has a priority value under 0', function () {
    const fixtureExplorerAPIs: ExplorerAPI[] = [{
      serviceURL: 'https://fixture-url.tld',
      priority: -1,
      parsingFunction: (): TransactionData => {
        return {
          remoteHash: 'a',
          issuingAddress: 'b',
          time: 'c',
          revokedAddresses: ['d']
        };
      }
    }];

    it('should throw the right error', function () {
      expect(() => {
        ensureValidity(fixtureExplorerAPIs);
      }).toThrow('One or more of your custom explorer APIs has a priority set below zero');
    });
  });

  describe('given at least one custom explorer\'s parsing function is missing', function () {
    const fixtureExplorerAPIs: ExplorerAPI[] = [{
      serviceURL: 'https://fixture-url.tld',
      priority: 0,
      parsingFunction: undefined
    }];

    it('should throw the right error', function () {
      expect(() => {
        ensureValidity(fixtureExplorerAPIs);
      }).toThrow('One or more of your custom explorer APIs does not have a parsing function');
    });
  });
});
