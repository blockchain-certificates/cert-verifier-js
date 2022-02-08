import Fixtures from '../../../fixtures';
import { BlockcertsVersion, retrieveBlockcertsVersion } from '../../../../src/parsers/helpers/retrieveBlockcertsVersion';
import Versions from '../../../../src/constants/certificateVersions';

describe('retrieveBlockcertsVersion test suite', function () {
  let output: BlockcertsVersion;

  describe('when provided with the contexts of a v1 certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(Fixtures.TestnetV1Valid['@context']);
    });

    it('should return versionNumber 1', function () {
      expect(output.versionNumber).toBe(1);
    });

    it('should return version v1_2', function () {
      expect(output.version).toBe(Versions.V1_2);
    });
  });

  describe('when provided with the contexts of a v2 certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(Fixtures.MainnetV2Valid['@context']);
    });

    it('should return versionNumber 2', function () {
      expect(output.versionNumber).toBe(2);
    });

    it('should return version v2_0', function () {
      expect(output.version).toBe(Versions.V2_0);
    });
  });

  describe('when provided with the contexts of a v3 alpha certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(Fixtures.BlockcertsV3AlphaCustomContext['@context']);
    });

    it('should return versionNumber 3', function () {
      expect(output.versionNumber).toBe(3);
    });

    it('should return version v3 alpha', function () {
      expect(output.version).toBe(Versions.V3_0_alpha);
    });
  });

  describe('when provided with the contexts of a v3 beta certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(Fixtures.BlockcertsV3Beta['@context']);
    });

    it('should return versionNumber 3', function () {
      expect(output.versionNumber).toBe(3);
    });

    it('should return version v3 beta', function () {
      expect(output.version).toBe(Versions.V3_0_beta);
    });
  });

  describe('when provided with the contexts of a v3 certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(Fixtures.BlockcertsV3['@context']);
    });

    it('should return versionNumber 3', function () {
      expect(output.versionNumber).toBe(3);
    });

    it('should return version v3.0', function () {
      expect(output.version).toBe(Versions.V3_0);
    });
  });
});
