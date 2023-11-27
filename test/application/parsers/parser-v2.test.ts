import parseJSON from '../../../src/parsers/index';
import fixture from '../../fixtures/v2/ethereum-main-valid-2.0.json';

describe('Parser test suite', function () {
  describe('given it is called with a blockcerts v2', function () {
    it('does not support parsing', async function () {
      const result = await parseJSON(fixture);
      expect(result.isFormatValid).toBe(false);
      expect(result.error).toBe('The verification of a Blockcerts v2 or v3 is not supported by this library which is only a legacy support for Blockcerts v1. Please use @blockcerts/cert-verifier-js for modern versions.');
    });
  });
});
