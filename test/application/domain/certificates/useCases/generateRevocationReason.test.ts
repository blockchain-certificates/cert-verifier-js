import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import domain from '../../../../../src/domain';
import { CREDENTIAL_STATUS_OPTIONS } from '../../../../../src/domain/certificates/useCases/generateRevocationReason';

describe('domain certificates generate revocation reason test suite', function () {
  describe('given it is called with a reason', function () {
    it('should return the revocation message with the reason', function () {
      const reasonFixture = 'This is a reason fixture.';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is called with a reason without a closing period', function () {
    it('should return the revocation message with the reason and a period', function () {
      const reasonFixture = 'This is a reason fixture';
      const revocationReasonAssertion = `This certificate has been revoked by the issuer. Reason given: ${reasonFixture}.`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is called without a reason', function () {
    it('should return the revocation message without a reason', function () {
      const revocationReasonAssertion = 'This certificate has been revoked by the issuer.';
      const result = domain.certificates.generateRevocationReason();
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('given it is suspended', function () {
    it('should return the revocation message adapted for suspension', function () {
      const revocationReasonAssertion = 'This certificate has been suspended by the issuer.';
      const result = domain.certificates.generateRevocationReason('', CREDENTIAL_STATUS_OPTIONS.SUSPENDED);
      expect(result).toBe(revocationReasonAssertion);
    });
  });

  describe('when the locale is set to Spanish', function () {
    beforeEach(function () {
      domain.i18n.setLocale('es');
    });

    afterEach(function () {
      domain.i18n.setLocale('en');
    });

    it('should return the revocation message in Spanish', function () {
      const reasonFixture = 'Esta es una razón de ejemplo.';
      const revocationReasonAssertion = `Este certificado ha sido revocado por el emisor. Motivo: ${reasonFixture}`;
      const result = domain.certificates.generateRevocationReason(reasonFixture);
      expect(result).toBe(revocationReasonAssertion);
    });

    describe('when the credential is suspended', function () {
      it('should return the suspension message in Spanish', function () {
        const revocationReasonAssertion = 'Este certificado ha sido suspendido por el emisor.';
        const result = domain.certificates.generateRevocationReason('', CREDENTIAL_STATUS_OPTIONS.SUSPENDED);
        expect(result).toBe(revocationReasonAssertion);
      });
    });
  });
});
