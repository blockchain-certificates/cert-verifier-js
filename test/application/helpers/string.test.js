import { startsWith } from '../../../src/helpers/string';

describe('startsWith method', () => {
  describe('when given a invalid stringContent', () => {
    it('should return false', () => {
      const result = startsWith(100, 'foo');
      expect(result).toBe(false);
    });
  });

  describe('when given a valid stringContent', () => {
    describe('when given a valid pattern', () => {
      it('should return true', () => {
        const content = 'foo bar';
        const result = startsWith(content, 'foo');
        expect(result).toBe(true);
      });
    });

    describe('when given an invalid pattern', () => {
      it('should return false', () => {
        const content = 'foo bar';
        const result = startsWith(content, 'qaz');
        expect(result).toBe(false);
      });
    });
  });
});
