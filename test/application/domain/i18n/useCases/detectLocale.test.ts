import { describe, it, expect, beforeEach } from 'vitest';
import domain from '../../../../../src/domain';

describe('domain i18n detectLocale use case test suite', function () {
  describe('given it detected the navigator locale', function () {
    beforeEach(function () {
      Object.defineProperty(globalThis.navigator, 'language', {
        configurable: true,
        get: () => 'fr-FR'
      });
    });

    it('should return the detected locale', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('fr-FR');
    });
  });

  describe('given it did not get any navigator properties', function () {
    beforeEach(function () {
      Object.defineProperty(globalThis.navigator, 'language', {
        configurable: true,
        get: () => null
      });
    });

    it('should return default locale', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('en-US');
    });
  });
});
