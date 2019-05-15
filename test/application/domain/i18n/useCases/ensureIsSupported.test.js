import domain from '../../../../../src/domain';

describe('domain i18n ensureIsSupported use case test suite', function () {
  let instance;

  afterEach(function () {
    instance = null;
  });

  describe('given the set locale is supported', function () {
    it('should return the set locale', function () {
      instance = domain.i18n.ensureIsSupported('es');
      expect(instance).toBe('es');
    });

    describe('and of different case', () => {
      it('should return the set locale', () => {
        instance = domain.i18n.ensureIsSupported('es-es');
        expect(instance).toBe('es');
      });
    });
  });

  describe('given the set locale is RFC 3066 language format', () => {
    it('should return the language tag that first matches', () => {
      instance = domain.i18n.ensureIsSupported('fr');
      expect(instance).toBe('fr');
    });
  });

  describe('given the set locale is not supported', function () {
    it('should return the default locale', function () {
      instance = domain.i18n.ensureIsSupported('az-az');
      expect(instance).toBe('en-US');
    });
  });
});
