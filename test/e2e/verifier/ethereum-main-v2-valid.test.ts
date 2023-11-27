import { Certificate } from '../../../src';
import EthereumMainV2Valid from '../../fixtures/v2/ethereum-main-valid-2.0.json';

describe('given the certificate is a valid ethereum main', function () {
  it('should not support verification', async function () {
    await expect(async () => {
      const certificate = new Certificate(EthereumMainV2Valid);
      await certificate.init();
      await certificate.verify();
    }).rejects.toThrow('not supported');
  });
});
