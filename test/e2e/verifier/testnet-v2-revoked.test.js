import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as explorer from '../../../src/explorers/explorer';

describe('given the certificate is a revoked testnet', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(explorer, 'getTransactionFromApi').resolves({
      remoteHash: '7570ad1a939b1d733668125df3e71ebbd593358e7d851eff3fdebd487462daab',
      issuingAddress: 'mkAvTwCYUyVk3rncFVCTJt1HUDsApVezhP',
      time: '2017-05-03T17:06:19.000Z',
      revokedAddresses: [
        'mkAvTwCYUyVk3rncFVCTJt1HUDsApVezhP'
      ]
    });
    certificate = new Certificate(FIXTURES.TestnetRevokedV2);
    await certificate.init();
    result = await certificate.verify();
  });

  afterAll(function () {
    sinon.restore();
  });

  it('should fail', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the error message', function () {
    expect(result.message).toBe('Transaction occurred at time when issuing address was not considered valid.');
  });
});
