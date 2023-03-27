import Verifier from '../../../src/verifier';
import FIXTURES from '../../fixtures';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import v3RevocationList from '../../assertions/v3-revocation-list';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import fixtureMainnetIssuerProfile from '../../fixtures/issuer-profile-mainnet-example.json';
import fixtureMainnetRevocationList from '../../fixtures/revocation-list-mainnet-example.json';

describe('Verifier checkRevokedStatus method test suite', function () {
  let requestStub;

  beforeEach(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json?assertionId=urn%3Auuid%3Abbba8553-8ec1-445f-82c9-a57251dd731c'
    }).resolves(JSON.stringify(v3RevocationList));
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
    }).resolves(JSON.stringify(fixtureMainnetIssuerProfile));
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39'
    }).resolves(JSON.stringify(fixtureMainnetRevocationList));
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('given the revocation of the certificate is handled by the legacy (Blockcerts) approach', function () {
    describe('and the certificate is revoked', function () {
      it('should record the verification step failure', async function () {
        const fixture = FIXTURES.MainnetV2Revoked;
        const verifier = new Verifier({
          certificateJson: fixture,
          expires: '',
          id: fixture.id,
          issuer: fixture.badge.issuer,
          revocationKey: null,
          explorerAPIs: undefined,
          hashlinkVerifier: new HashlinkVerifier()
        });
        await verifier.init();
        await (verifier as any).checkRevokedStatus(); // private method
        expect((verifier as any)._stepsStatuses).toEqual([{
          code: 'checkRevokedStatus',
          message: 'This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.',
          status: 'failure'
        }]);
      });
    });

    describe('and the certificate is not revoked', function () {
      it('should record the verification step success', async function () {
        const fixture = FIXTURES.BlockcertsV3VerificationMethodIssuerProfile;
        const verifier = new Verifier({
          certificateJson: fixture,
          expires: '',
          id: fixture.id,
          issuer: fixtureBlockcertsIssuerProfile,
          revocationKey: null,
          explorerAPIs: undefined,
          hashlinkVerifier: new HashlinkVerifier()
        });
        await verifier.init();
        await (verifier as any).checkRevokedStatus(); // private method
        expect((verifier as any)._stepsStatuses).toEqual([{
          code: 'checkRevokedStatus',
          status: 'success'
        }]);
      });
    });
  });

  describe('given the revocation of the certificate is a W3C StatusList2021', function () {
    beforeEach(function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(BlockcertsStatusList2021));
    });

    describe('and the certificate is not revoked', function () {
      it('should record the verification step success', async function () {
        const fixture = FIXTURES.StatusList2021;
        const verifier = new Verifier({
          certificateJson: fixture,
          expires: '',
          id: fixture.id,
          issuer: fixtureBlockcertsIssuerProfile,
          revocationKey: null,
          explorerAPIs: undefined,
          hashlinkVerifier: new HashlinkVerifier()
        });
        await verifier.init();
        await (verifier as any).checkRevokedStatus(); // private method
        expect((verifier as any)._stepsStatuses).toEqual([{
          code: 'checkRevokedStatus',
          status: 'success'
        }]);
      });
    });

    describe('and the certificate is revoked', function () {
      it('should record the verification step success', async function () {
        const fixture = FIXTURES.StatusList2021Revoked;
        const verifier = new Verifier({
          certificateJson: fixture,
          expires: '',
          id: fixture.id,
          issuer: fixtureBlockcertsIssuerProfile,
          revocationKey: null,
          explorerAPIs: undefined,
          hashlinkVerifier: new HashlinkVerifier()
        });
        await verifier.init();
        await (verifier as any).checkRevokedStatus(); // private method
        expect((verifier as any)._stepsStatuses).toEqual([{
          code: 'checkRevokedStatus',
          message: 'Certificate has been revoked',
          status: 'failure'
        }]);
      });
    });
  });
});
