import domain from '../../../../../src/domain';
import sinon from 'sinon';

describe('domain i18n ensureIsSupported use case test suite', function () {
  const fixtureSupportedLanguages = ['en-US', 'es-ES'];
  const fixtureSupportedLocale = 'es-ES';
  const fixtureSupportedLowerCaseLocale = 'es-es';
  const fixtureUnsupportedLocale = 'az-az';
  const assertionDefaultLocale = 'en-US';
  const fixtureIsoLocale = 'es';
  let stubGetSupportedLocales;
  let instance;

  beforeEach(function () {
    stubGetSupportedLocales = sinon.stub(domain.i18n, 'getSupportedLanguages').returns(fixtureSupportedLanguages);
  });

  afterEach(function () {
    stubGetSupportedLocales.restore();
    instance = null;
  });

  it('should get the list of supported languages', function () {
    instance = domain.i18n.ensureIsSupported(fixtureSupportedLocale);
    expect(stubGetSupportedLocales.calledOnce).toBe(true);
  });

  describe('given the set locale is supported', function () {
    it('should return the set locale', function () {
      instance = domain.i18n.ensureIsSupported(fixtureSupportedLocale);
      expect(instance).toBe(fixtureSupportedLocale);
    });

    describe('and of different case', () => {
      it('should return the set locale', () => {
        instance = domain.i18n.ensureIsSupported(fixtureSupportedLowerCaseLocale);
        expect(instance).toBe(fixtureSupportedLocale);
      });
    });
  });

  describe('given the set locale is RFC 3066 language format', () => {
    it('should return the language tag that first matches', () => {
      instance = domain.i18n.ensureIsSupported(fixtureIsoLocale);
      expect(instance).toBe(fixtureSupportedLocale);
    });
  });

  describe('given the set locale is not supported', function () {
    it('should return the default locale', function () {
      instance = domain.i18n.ensureIsSupported(fixtureUnsupportedLocale);
      expect(instance).toBe(assertionDefaultLocale);
    });
  });
});
