import { describe, it, expect } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import issuerBlockcertsV1 from '../../fixtures/issuer-blockcerts-v1.json';
import TestnetV2ValidV1Issuer from '../../fixtures/v2/testnet-valid-v1-issuer-2.0.json';

describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', function () {
  it('should verify successfully', async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '4bc7314351723d1670ff49250aada05d6e5da31d0369a999f8e3cbc7fede5b74',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-05-03T18:29:43.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://www.blockcerts.org/mockissuer/issuer/issuerTestnet_v1.json'
    }).resolves(JSON.stringify(issuerBlockcertsV1));
    const certificate = new Certificate(TestnetV2ValidV1Issuer);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
