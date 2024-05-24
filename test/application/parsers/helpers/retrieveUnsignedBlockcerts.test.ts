import { describe, it, expect } from 'vitest';
import retrieveUnsignedBlockcerts from '../../../../src/parsers/helpers/retrieveUnsignedBlockcerts';
import EthereumMainV2Valid from '../../../fixtures/v2/ethereum-main-valid-2.0.json';
import BlockcertsV3 from '../../../fixtures/v3/testnet-v3-did.json';

describe('retrieveUnsignedBlockcerts test suite', function () {
  describe('given it is passed a v2 certificate', function () {
    it('should return the document without the signature', function () {
      const fixture = Object.assign({}, EthereumMainV2Valid);
      const expectedOutput = Object.assign({}, EthereumMainV2Valid);
      delete expectedOutput.signature;
      expect(retrieveUnsignedBlockcerts(fixture)).toEqual(expectedOutput);
    });
  });

  describe('given it is passed a v3 certificate', function () {
    it('should return the document without the proof', function () {
      const fixture = Object.assign({}, BlockcertsV3);
      const expectedOutput = Object.assign({}, BlockcertsV3);
      delete expectedOutput.proof;
      expect(retrieveUnsignedBlockcerts(fixture)).toEqual(expectedOutput);
    });
  });
});
