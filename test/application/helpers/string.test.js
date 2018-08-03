import { startsWith } from '../../../src/helpers/string';

describe('startsWith method', function () {
  describe('when given a invalid stringContent', function () {
    it('should return false', function () {
      const result = startsWith(100, 'foo');
      expect(result).toBe(false);
    });
  });

  describe('when given a valid stringContent', function () {
    describe('when given a valid pattern', function () {
      it('should return true', function () {
        const content = 'foo bar';
        const result = startsWith(content, 'foo');
        expect(result).toBe(true);
      });
    });

    describe('when given an invalid pattern', function () {
      it('should return false', function () {
        const content = 'foo bar';
        const result = startsWith(content, 'qaz');
        expect(result).toBe(false);
      });
    });
  });
});
