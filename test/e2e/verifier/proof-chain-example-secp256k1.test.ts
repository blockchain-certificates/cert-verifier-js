import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/proof-chain-example-secp256k1.json';

describe('V3 blockcerts', function () {
  it('should not verify', async function () {
    await expect(async () => {
      const instance = new Certificate(fixture);
      await instance.init();
      await instance.verify();
    }).rejects.toThrow('not supported');
  });
});
