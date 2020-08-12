import { deepCopy } from '../../../src/helpers/object';

describe('deepCopy method', function () {
  it('should return false', function () {
    const fixtureObject = { key: 'value' };
    const fixtureObjectDeepCopy = { key: 'value' };
    const result = deepCopy<object>(fixtureObject);
    fixtureObject.key = 'updated value';
    expect(result).toEqual(fixtureObjectDeepCopy);
  });
});
