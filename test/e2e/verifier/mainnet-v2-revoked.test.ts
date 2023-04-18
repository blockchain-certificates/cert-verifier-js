import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import v2IssuerProfile from '../../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RevocationList from '../../assertions/v2-revocation-list';
import MainnetV2Revoked from '../../fixtures/v2/mainnet-revoked-2.0.json';

describe('given the certificate is a revoked mainnet', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
    }).resolves(JSON.stringify(v2IssuerProfile));
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39'
    }).resolves(JSON.stringify(v2RevocationList));
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '4f877ca8cf3029c248e53cc93b6929ca28af2f11092785efcbc99127c9695d9d',
      issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      time: '2020-09-02T16:39:43.000Z',
      revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo']
    });
    certificate = new Certificate(MainnetV2Revoked);
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
    expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.');
  });
});
