import Verifier from '../../../src/verifier';
import FIXTURES from '../../fixtures';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import IssuerBlockcerts from '../../fixtures/issuer-blockcerts.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';

describe('Verifier checkRevokedStatus method test suite', function () {
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
          issuer: IssuerBlockcerts,
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
      const requestStub = sinon.stub(ExplorerLookup, 'request');
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
          issuer: IssuerBlockcerts,
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
          issuer: IssuerBlockcerts,
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
