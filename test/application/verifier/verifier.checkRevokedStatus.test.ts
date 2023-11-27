import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import Verifier from '../../../src/verifier';
import fixtureV1 from '../../fixtures/v1/mainnet-valid-1.2.json';
import fixtureV1IssuerProfile from '../../fixtures/v1/got-issuer_live.json';

describe('Verifier checkRevokedStatus method test suite', function () {
  let requestStub;

  beforeAll(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
    }).resolves(JSON.stringify(fixtureV1IssuerProfile));
  });

  afterAll(function () {
    sinon.restore();
  });

  describe('given the revocation of the certificate is handled by the legacy (Blockcerts) approach', function () {
    // WE DO NOT HAVE A REVOKED V1 CERT to test with
    // describe('and the certificate is revoked', function () {
    //   it('should record the verification step failure', async function () {
    //     const fixture = MainnetV2Revoked;
    //     const verifier = new Verifier({
    //       certificateJson: fixture,
    //       expires: '',
    //       id: fixture.id,
    //       issuer: fixture.badge.issuer,
    //       revocationKey: null,
    //       explorerAPIs: undefined
    //     });
    //     await verifier.init();
    //     await (verifier as any).checkRevokedStatus(); // private method
    //     expect((verifier as any)._stepsStatuses).toEqual([{
    //       code: 'checkRevokedStatus',
    //       message: 'This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.',
    //       status: 'failure'
    //     }]);
    //   });
    // });

    describe('and the certificate is not revoked', function () {
      it('should record the verification step success', async function () {
        const fixture = fixtureV1;
        const verifier = new Verifier({
          certificateJson: fixture,
          expires: '',
          id: fixture.document.assertion.id,
          issuer: fixtureV1IssuerProfile,
          revocationKey: null,
          explorerAPIs: undefined
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
});
