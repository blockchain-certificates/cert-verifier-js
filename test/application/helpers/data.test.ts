import { toByteArray, toUTF8Data } from '../../../src/helpers/data';

describe('data helper test suite', function () {
  describe('toByteArray function', function () {
    it('should return a base16 encoded array', function () {
      const testString = '6ad52e9db922e0c2648ce8f88f94b7e376daf9af60a7c782db';
      const expectedOutput = [106, 213, 46, 157, 185, 34, 224, 194, 100, 140, 232, 248, 143, 148, 183, 227, 118, 218, 249, 175, 96, 167, 199, 130, 219];
      const output = toByteArray(testString);
      expect(output).toEqual(expectedOutput);
    });
  });
});

describe('toUTF8Data method', function () {
  describe('given a string', function () {
    it('should return a UTF8 encoded array from the characters', function () {
      const output = toUTF8Data('test');
      expect(output).toEqual([116, 101, 115, 116]);
    });
  });
});
