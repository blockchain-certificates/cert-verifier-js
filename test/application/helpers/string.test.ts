import { describe, it, expect } from 'vitest';
import { capitalize, isString, startsWith } from '../../../src/helpers/string';

describe('startsWith method', function () {
  describe('when given a invalid stringContent', function () {
    it('should return false', function () {
      const result = startsWith(100 as any, 'foo');
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

describe('capitalize method', function () {
  it('should return the capitalized word', function () {
    const output = capitalize('test');
    expect(output).toBe('Test');
  });
});

describe('isString method', function () {
  describe('when called with a string', function () {
    it('should return true', function () {
      const test = 'string';
      expect(isString(test)).toBe(true);
    });
  });

  describe('when not called with a string', function () {
    it('should return false', function () {
      const test = {
        test: 'not a string'
      };
      expect(isString(test)).toBe(false);
    });
  });
});
