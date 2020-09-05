import { safelyAppendUrlParameter } from '../../../src/helpers/url';

describe('safelyAppendUrlParameter method', function () {
  let fixtureUrl: string;
  const fixtureParameterKey = 'parameterKey';
  const fixtureParameterValue = 'parameterValue';

  describe('given the url already has parameter', function () {
    it('should return the url with the parameter correctly appended', function () {
      fixtureUrl = 'https://www.domain.tld/path/to/page?key=value';
      const assertionURL = `${fixtureUrl}&${fixtureParameterKey}=${fixtureParameterValue}`;
      expect(safelyAppendUrlParameter(fixtureUrl, fixtureParameterKey, fixtureParameterValue))
        .toEqual(assertionURL);
    });
  });

  describe('given the url does not already have parameter', function () {
    it('should return the url with the parameter correctly appended', function () {
      fixtureUrl = 'https://www.domain.tld/path/to/page';
      const assertionURL = `${fixtureUrl}?${fixtureParameterKey}=${fixtureParameterValue}`;
      expect(safelyAppendUrlParameter(fixtureUrl, fixtureParameterKey, fixtureParameterValue))
        .toEqual(assertionURL);
    });
  });
});
