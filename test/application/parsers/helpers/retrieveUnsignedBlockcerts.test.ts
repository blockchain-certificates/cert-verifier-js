import FIXTURES from '../../../fixtures';
import retrieveUnsignedBlockcerts from '../../../../src/parsers/helpers/retrieveUnsignedBlockcerts';

describe('retrieveUnsignedBlockcerts test suite', function () {
  describe('given it is passed a v2 certificate', function () {
    it('should return the document without the signature', function () {
      const fixture = Object.assign({}, FIXTURES.EthereumMainV2Valid);
      const expectedOutput = Object.assign({}, FIXTURES.EthereumMainV2Valid);
      delete expectedOutput.signature;
      expect(retrieveUnsignedBlockcerts(fixture)).toEqual(expectedOutput);
    });
  });

  describe('given it is passed a v3 certificate', function () {
    it('should return the document without the proof', function () {
      const fixture = Object.assign({}, FIXTURES.BlockcertsV3);
      const expectedOutput = Object.assign({}, FIXTURES.BlockcertsV3);
      delete expectedOutput.proof;
      expect(retrieveUnsignedBlockcerts(fixture)).toEqual(expectedOutput);
    });
  });
});
