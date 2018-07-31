import { intersect } from '../../../src/helpers/array';

describe('Array Helper', () => {
  describe('intersect method', () => {
    describe('given it is called with two arrays', () => {
      it('should return an array of intersect', () => {
        const fixture1 = ['1', '1a', '3a', '4a', '5a', '6a'];
        const fixture2 = ['1a', '2', '3b', '4e', '5d', '6e'];
        const assertion = ['1a'];
        const result = intersect(fixture1, fixture2);

        expect(result).toEqual(assertion);
      });
    });
  });
});
