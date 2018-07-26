import { stripHashPrefix } from '../../../../src/explorers/utils/stripHashPrefix';

describe('explorers utils cleanupRemoteHash test suite', () => {
  describe('given it is called with a remoteHash & a set of prefixes', () => {
    it('should return the hash stripped of prefixes', () => {
      const remoteHashFixture = '6a20x1234567890';
      const prefixes = ['6a20', 'OP_RETURN '];
      const hashAssertion = 'x1234567890';
      expect(stripHashPrefix(remoteHashFixture, prefixes)).toBe(hashAssertion);
    });
  });
});
