import parseJSON from '../../../src/parsers/index';
import fixture from '../../fixtures/v3/proof-chain-example-secp256k1.json';

describe('Parser test suite', function () {
  describe('given it is called with a blockcerts v3', function () {
    it('does not support parsing', async function () {
      const result = await parseJSON(fixture);
      expect(result.isFormatValid).toBe(false);
      expect(result.error).toBe('The verification of a Blockcerts v2 or v3 is not supported by this library which is only a legacy support for Blockcerts v1. Please use @blockcerts/cert-verifier-js for modern versions.');
    });
  });
});
