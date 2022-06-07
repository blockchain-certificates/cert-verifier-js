import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';
import sinon from 'sinon';
import domain from '../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import v2IssuerProfile from '../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RevocationList from '../assertions/v2-revocation-list';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../assertions/v3.0-issuer-profile.json';
import v3RevocationList from '../assertions/v3-revocation-list';
const verifier = require('../../dist/verifier-es');

describe('verifier build test suite', function () {
  let lookForTxStub;
  let requestStub;

  beforeEach(function () {
    lookForTxStub = sinon.stub(domain.verifier, 'lookForTx');
    requestStub = sinon.stub(ExplorerLookup, 'request');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('throws a deprecation error with a v1 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.TestnetV1Valid);
    expect(async () => {
      await certificate.init();
    }).rejects.toThrow('Verification of v1 certificates is not supported by this component. ' +
      'See the python cert-verifier for v1.1 verification ' +
      'or the npm package cert-verifier-js-v1-legacy for v1.2 ' +
      '(https://www.npmjs.com/package/@blockcerts/cert-verifier-js-v1-legacy)');
  });

  it('works as expected with a v2 certificate', async function () {
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
    }).resolves(JSON.stringify(v2IssuerProfile));
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39'
    }).resolves(JSON.stringify(v2RevocationList));

    lookForTxStub.resolves({
      remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
      issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      time: '2018-02-08T00:23:34.000Z',
      revokedAddresses: [
        '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
      ]
    });

    const certificate = new verifier.Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  it('works as expected with a v3 certificate', async function () {
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
    }).resolves(JSON.stringify(v3RevocationList));
    lookForTxStub.resolves({
      remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
      issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
      time: '2022-04-05T18:45:30.000Z',
      revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
    });

    const certificate = new verifier.Certificate(FIXTURES.BlockcertsV3);
    await certificate.init();
    const result = await certificate.verify();
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
