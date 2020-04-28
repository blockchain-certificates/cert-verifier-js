import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as explorer from '../../../src/explorers/explorer';

describe('given the certificate is a valid mainnet (v2.0 alpha)', function () {
  it('should verify successfully', async function () {
    sinon.stub(explorer, 'getTransactionFromApi').resolves({
      remoteHash: '7570ad1a939b1d733668125df3e71ebbd593358e7d851eff3fdebd487462daab',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-05-03T17:06:19.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    const certificate = new Certificate(FIXTURES.MainnetV2AlphaValid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
