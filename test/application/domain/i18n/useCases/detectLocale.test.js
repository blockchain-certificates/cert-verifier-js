import domain from '../../../../../src/domain';

describe('domain i18n detectLocale use case test suite', function () {
  describe('given it detected the navigator locale', function () {
    beforeEach(function () {
      navigator.__defineGetter__('language', function () {
        return 'fr-FR';
      });
    });

    it('should return the detected locale', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('fr-FR');
    });
  });

  describe('given it did not get the navigator language property', function () {
    beforeEach(function () {
      navigator.__defineGetter__('language', function () {
        return null;
      });
      navigator.__defineGetter__('userLanguage', function () {
        return 'fr-FR';
      });
    });

    it('should return the navigator userLanguage', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('fr-FR');
    });
  });

  describe('given it did not get the navigator language or userLanguage property', function () {
    beforeEach(function () {
      navigator.__defineGetter__('language', function () {
        return null;
      });
      navigator.__defineGetter__('userLanguage', function () {
        return null;
      });
      navigator.__defineGetter__('browserLanguage', function () {
        return 'fr-FR';
      });
    });

    it('should return the navigator userLanguage', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('fr-FR');
    });
  });

  describe('given it did not get any navigator properties', function () {
    beforeEach(function () {
      navigator.__defineGetter__('language', function () {
        return null;
      });
      navigator.__defineGetter__('userLanguage', function () {
        return null;
      });
      navigator.__defineGetter__('browserLanguage', function () {
        return null;
      });
    });

    it('should return default locale', function () {
      const locale = domain.i18n.detectLocale();
      expect(locale).toBe('en-US');
    });
  });
});
