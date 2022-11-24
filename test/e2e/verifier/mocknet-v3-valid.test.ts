import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import secp256k1IssuerProfile from '../../assertions/hyland-issuer-profile-secp256k1.json';
import merkleProofMocknetIssuerProfile from '../../assertions/hyland-issuer-profile-mocknet-merkleproof2019.json';

describe('given the certificate is a valid mocknet (v3.0)', function () {
  it('should verify successfully', async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');

    requestStub.withArgs({
      url: 'https://issuer.dev.hylandcredentials.com/93d02af5-8683-452a-a79c-959deae72495/issuer_profile.json'
    }).resolves(JSON.stringify(secp256k1IssuerProfile));
    requestStub.withArgs({
      url: 'https://issuer.dev.hylandcredentials.com/61e6c3fc-5779-4a6d-b05f-fdd10fdac5f0/issuer_profile.json'
    }).resolves(JSON.stringify(merkleProofMocknetIssuerProfile));
    requestStub.withArgs({
      url: 'https://test.hyland.com/revocation?assertionId=urn%3Auuid%3Ae3351aa6-61e2-4d13-bd96-e848aa0c75cd'
    }).resolves(JSON.stringify({
      '@context': 'https://w3id.org/openbadges/v2',
      id: 'https://issuerprofile.hyland.com/revocations',
      type: 'RevocationList',
      issuer: 'https://issuer.dev.hylandcredentials.com/61e6c3fc-5779-4a6d-b05f-fdd10fdac5f0/issuer_profile.json',
      revokedAssertions: []
    }));

    const certificate = new Certificate(FIXTURES.MocknetV3Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
