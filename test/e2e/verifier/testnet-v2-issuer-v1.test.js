import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as explorer from '../../../src/explorers/explorer';

describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', function () {
  it('should verify successfully', async function () {
    sinon.stub(explorer, 'getTransactionFromApi').resolves({
      remoteHash: '4bc7314351723d1670ff49250aada05d6e5da31d0369a999f8e3cbc7fede5b74',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-05-03T18:29:43.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    const certificate = new Certificate(FIXTURES.TestnetV2ValidV1Issuer);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
