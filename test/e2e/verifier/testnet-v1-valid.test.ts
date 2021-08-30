import { Certificate } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a valid testnet (v1.2)', function () {
  it('should not support the verification and throw an error', async function () {
    const certificate = new Certificate(FIXTURES.TestnetV1Valid);
    await expect(async () => {
      await certificate.init();
    }).rejects.toThrow('Verification of v1 certificates is not supported by this component. ' +
      'See the python cert-verifier for v1.1 verification ' +
      'or the npm package cert-verifier-js-v1-legacy for v1.2 ' +
      '(https://www.npmjs.com/package/@blockcerts/cert-verifier-js-v1-legacy)');
  });
});
