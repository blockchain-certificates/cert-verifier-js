import { describe, it, expect } from 'vitest';
import parseJSON from '../../../src/parsers/index';
import TestnetV1Valid from '../../fixtures/v1/testnet-valid-1.2.json';

describe('Parser test suite', function () {
  describe('given it is called with a v1 certificate data', function () {
    it('should return a deprecation error', async function () {
      const res = await parseJSON(TestnetV1Valid as any);
      expect(res.error).toBe('Verification of v1 certificates is not supported by this component. ' +
        'See the python cert-verifier for v1.1 verification ' +
        'or the npm package cert-verifier-js-v1-legacy for v1.2 ' +
        '(https://www.npmjs.com/package/@blockcerts/cert-verifier-js-v1-legacy)');
    });
  });
});
