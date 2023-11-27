import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example-secp256k1.json';

describe('Certificate entity test suite', function () {
  describe('given it is called with a blockcerts v3', function () {
    it('does not support parsing', async function () {
      await expect(async () => {
        const certificate = new Certificate(fixture);
        await certificate.init();
      }).rejects.toThrow('not supported');
    });
  });
});
