import FIXTURES from '../../../fixtures';
import retrieveUnsignedBlockcerts from '../../../../src/parsers/helpers/retrieveUnsignedBlockcerts';
import Versions from '../../../../src/constants/certificateVersions';

describe('retrieveUnsignedBlockcerts test suite', function () {
  describe('given it is passed a v2 certificate', function () {
    it('should return the document without the signature', function () {
      const fixture = Object.assign({}, FIXTURES.EthereumMainV2Valid);
      const expectedOutput = Object.assign({}, FIXTURES.EthereumMainV2Valid);
      delete expectedOutput.signature;
      expect(retrieveUnsignedBlockcerts(fixture, Versions.V2_0)).toEqual(expectedOutput);
    });
  });

  describe('given it is passed a v3 certificate', function () {
    it('should return the document without the proof', function () {
      const fixture = Object.assign({}, FIXTURES.BlockcertsV3);
      const expectedOutput = Object.assign({}, FIXTURES.BlockcertsV3);
      delete expectedOutput.proof;
      expect(retrieveUnsignedBlockcerts(fixture, Versions.V3_0)).toEqual(expectedOutput);
    });
  });
});
