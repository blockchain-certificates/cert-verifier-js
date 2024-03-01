import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import MocknetVCV2DataIntegrityProof from '../../fixtures/v3/mocknet-vc-v2-data-integrity-proof.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is signed with a DataIntegrityProof Merkle Proof 2019', function () {
  beforeAll(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
  });

  let certificate;
  let result;
  beforeEach(async function () {
    certificate = new Certificate(MocknetVCV2DataIntegrityProof);
    await certificate.init();
    result = await certificate.verify();
  });

  it('should be a valid verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
