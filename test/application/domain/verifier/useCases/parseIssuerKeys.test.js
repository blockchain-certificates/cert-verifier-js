import parseIssuerKeys from '../../../../../src/domain/verifier/useCases/parseIssuerKeys';
import issuerProfileV1JsonFixture from './fixtures/issuerProfileV1JsonFixture';
import issuerProfileV2JsonFixture from './fixtures/issuerProfileV2JsonFixture';
import parsedIssuerKeysV1Assertion from './assertions/parsedIssuerKeysV1Assertion';
import parsedIssuerKeysV2Assertion from './assertions/parsedIssuerKeysV2Assertion';

describe('domain verifier parseIssuerKeys use case test suite', () => {
  describe('given it is called with issuerProfileJson', () => {
    describe('given issuerProfileJson has a `@context` key', () => {
      it('should return an array of keys', () => {
        const result = parseIssuerKeys(issuerProfileV2JsonFixture);
        expect(result).toEqual(parsedIssuerKeysV2Assertion);
      });
    });

    describe('given issuerProfileJson does not have a `@context` key', () => {
      it('should return an array of keys', () => {
        const result = parseIssuerKeys(issuerProfileV1JsonFixture);
        expect(result).toEqual(parsedIssuerKeysV1Assertion);
      });
    });
  });
});
