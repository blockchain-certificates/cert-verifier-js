import Certificate from '../../src/certificate';
import FIXTURES from '../fixtures';
import assertionSpanishVerificationSteps from '../assertions/assertion-spanish-verification-steps';

describe('End-to-end i18n test suite', function () {
  describe('given the language is set to spanish', function () {
    let certificate;

    beforeEach(async function () {
      certificate = new Certificate(FIXTURES.TestnetV1Valid, { locale: 'es' });
      await certificate.init();
    });

    it('should set the locale to es', async function () {
      expect(certificate.locale).toBe('es');
    });

    it('should have the verification steps in spanish', async function () {
      expect(certificate.verificationSteps).toEqual(assertionSpanishVerificationSteps);
    });
  });
});
