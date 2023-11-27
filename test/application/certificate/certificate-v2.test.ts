import { Certificate } from '../../../src';
import fixture from '../../fixtures/v2/ethereum-main-valid-2.0.json';

describe('Certificate entity test suite', function () {
  describe('given it is called with a blockcerts v2', function () {
    it('does not support parsing', async function () {
      await expect(async () => {
        const certificate = new Certificate(fixture);
        await certificate.init();
      }).rejects.toThrow('not supported');
    });
  });
});
