import { prependHashPrefix } from '../../../../src/explorers/utils/prependHashPrefix';

describe('explorers utils cleanupRemoteHash test suite', function () {
  describe('given it is called with a remoteHash', function () {
    describe('given it is called without prefixes', function () {
      it('should return the remote hash', function () {
        const remoteHashFixture = '6a20x1234567890';
        const prefixes = [];
        expect(prependHashPrefix(remoteHashFixture, prefixes)).toBe(remoteHashFixture);
      });
    });

    describe('given it is called with a set of prefixes', function () {
      describe('and the hash does not start with the prefix', function () {
        it('should return the hash prepended with the prefixes', function () {
          const remoteHashFixture = '6a201234567890';
          const prefixes = ['0x'];
          const assertionNewHash = '0x6a201234567890';
          expect(prependHashPrefix(remoteHashFixture, prefixes)).toBe(assertionNewHash);
        });
      });

      describe('and the hash already start with the prefix', function () {
        it('should return the original hash', function () {
          const remoteHashFixture = '0x6a201234567890';
          const prefixes = ['0x'];
          expect(prependHashPrefix(remoteHashFixture, prefixes)).toBe(remoteHashFixture);
        });
      });
    });
  });
});
