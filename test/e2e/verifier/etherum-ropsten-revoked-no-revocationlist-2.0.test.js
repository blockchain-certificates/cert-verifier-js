import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate is a revoked certificate', function () {
  describe('and the revocationList is not provided in the certificate', function () {
    let certificate;

    beforeEach(async function () {
      certificate = new Certificate(FIXTURES.EthereumRopstenRevokedNoRevocationList);
      await certificate.init();
    });

    afterEach(function () {
      certificate = null;
    });

    it('should fail the verification', async function () {
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('should report the revocation status', async function () {
      const result = await certificate.verify();
      expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Testing revocation.');
    });
  });
});
