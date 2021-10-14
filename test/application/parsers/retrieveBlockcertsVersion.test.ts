import Fixtures from '../../fixtures';
import { retrieveBlockcertsVersion } from '../../../src/parsers/retrieveBlockcertsVersion';

describe('retrieveBlockcertsVersion test suite', function () {
  describe('when provided with the contexts of a v1 certificate', function () {
    it('should return 1', function () {
      const fixtureContexts = Fixtures.TestnetV1Valid['@context'];
      expect(retrieveBlockcertsVersion(fixtureContexts)).toBe(1);
    });
  });

  describe('when provided with the contexts of a v2 certificate', function () {
    it('should return 2', function () {
      const fixtureContexts = Fixtures.MainnetV2Valid['@context'];
      expect(retrieveBlockcertsVersion(fixtureContexts)).toBe(2);
    });
  });

  describe('when provided with the contexts of a v3 alpha certificate', function () {
    it('should return 3', function () {
      const fixtureContexts = Fixtures.BlockcertsV3AlphaCustomContext['@context'];
      expect(retrieveBlockcertsVersion(fixtureContexts)).toBe(3);
    });
  });

  describe('when provided with the contexts of a v3 beta certificate', function () {
    it('should return 3', function () {
      const fixtureContexts = Fixtures.BlockcertsV3Beta['@context'];
      expect(retrieveBlockcertsVersion(fixtureContexts)).toBe(3);
    });
  });
});
