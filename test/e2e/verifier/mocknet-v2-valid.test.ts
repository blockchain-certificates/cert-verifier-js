import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import v2TestnetIssuerProfile from '../../assertions/v2-testnet-issuer-profile.json';
import v2TestnetRevocationList from '../../assertions/v2-testnet-revocation-list.json';

describe('given the certificate is a valid mocknet (v2.0)', function () {
  it('should verify successfully', async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');

    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
    }).resolves(JSON.stringify(v2TestnetIssuerProfile));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/2.0/revocation-list-testnet.json?assertionId=urn:uuid:bbba8553-8ec1-445f-82c9-a57251dd731c'
    }).resolves(JSON.stringify(v2TestnetRevocationList));

    const certificate = new Certificate(FIXTURES.MocknetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
