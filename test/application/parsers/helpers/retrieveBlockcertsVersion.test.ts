import type { BlockcertsVersion } from '../../../../src/parsers/helpers/retrieveBlockcertsVersion';
import { retrieveBlockcertsVersion } from '../../../../src/parsers/helpers/retrieveBlockcertsVersion';
import Versions from '../../../../src/constants/certificateVersions';
import TestnetV1Valid from '../../../fixtures/v1/testnet-valid-1.2.json';
import MainnetV2Valid from '../../../fixtures/v2/mainnet-valid-2.0.json';
import BlockcertsV3Beta from '../../../fixtures/v3/blockcerts-3.0-beta.json';
import BlockcertsV3 from '../../../fixtures/v3/testnet-v3-did.json';

describe('retrieveBlockcertsVersion test suite', function () {
  let output: BlockcertsVersion;

  describe('when provided with the contexts of a v1 certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(TestnetV1Valid['@context']);
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
      output = retrieveBlockcertsVersion(MainnetV2Valid['@context']);
    });

    it('should return versionNumber 2', function () {
      expect(output.versionNumber).toBe(2);
    });

    it('should return version v2_0', function () {
      expect(output.version).toBe(Versions.V2_0);
    });
  });

  describe('when provided with the contexts of a v3 beta certificate', function () {
    beforeEach(function () {
      output = retrieveBlockcertsVersion(BlockcertsV3Beta['@context']);
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
      output = retrieveBlockcertsVersion(BlockcertsV3['@context']);
    });

    it('should return versionNumber 3', function () {
      expect(output.versionNumber).toBe(3);
    });

    it('should return version v3.0', function () {
      expect(output.version).toBe(Versions.V3_0);
    });
  });
});
