import Verifier from '../../../src/verifier';
import FIXTURES from '../../fixtures';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import IssuerBlockcerts from '../../fixtures/issuer-blockcerts.json';

describe('Verifier checkRevokedStatus method test suite', function () {
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
});
