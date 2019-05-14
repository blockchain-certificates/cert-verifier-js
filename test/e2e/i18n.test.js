import Certificate from '../../src/certificate';
import FIXTURES from '../fixtures';
import assertionSpanishVerificationSteps from '../assertions/assertion-spanish-verification-steps';

describe('End-to-end i18n test suite', function () {
  describe('given the language is set to spanish', () => {
    const certificate = new Certificate(FIXTURES.MainnetV2Valid, { locale: 'es' });

    it('should set the locale to es', async function () {
      expect(certificate.locale).toBe('es');
    });

    it('should have the verification steps in spanish', async function () {
      expect(certificate.verificationSteps).toEqual(assertionSpanishVerificationSteps);
    });
  });
});
