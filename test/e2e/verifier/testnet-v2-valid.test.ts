import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import domain from '../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';

describe('given the certificate is a valid testnet (v2.0)', function () {
  it('should verify successfully', async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: 'f029b45bb1a7b1f0b970f6de35344b73cccd16177b4c037acbc2541c7fc27078',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-06-29T22:10:29.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
    }).resolves(JSON.stringify(issuerBlockcertsV2a));
    const certificate = new Certificate(FIXTURES.TestnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
