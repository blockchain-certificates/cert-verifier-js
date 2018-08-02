import { stripHashPrefix } from '../../../../src/explorers/utils/stripHashPrefix';

describe('explorers utils cleanupRemoteHash test suite', function () {
  describe('given it is called with a remoteHash', function () {
    describe('given it is called without prefixes', function () {
      it('should return the remote hash', function () {
        const remoteHashFixture = '6a20x1234567890';
        const prefixes = [];
        expect(stripHashPrefix(remoteHashFixture, prefixes)).toBe(remoteHashFixture);
      });
    });
    describe('given it is called with a set of prefixes', function () {
      it('should return the hash stripped of prefixes', function () {
        const remoteHashFixture = '6a20x1234567890';
        const prefixes = ['6a20', 'OP_RETURN '];
        const hashAssertion = 'x1234567890';
        expect(stripHashPrefix(remoteHashFixture, prefixes)).toBe(hashAssertion);
      });
    });
  });
});
