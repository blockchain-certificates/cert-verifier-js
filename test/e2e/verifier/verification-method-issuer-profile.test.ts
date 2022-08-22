import { Certificate } from '../../../src';
import fixture from '../../fixtures/v3/testnet-v3-verification-method-issuer-profile.json';

describe('Proof verification method is bound to issuer profile test suite', function () {
  it('should verify', async function () {
    const certificate = new Certificate(fixture);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.message)
      .toBe('The EcdsaSecp256k1Signature2019 signature of this document has been successfully verified.');
  });
});
