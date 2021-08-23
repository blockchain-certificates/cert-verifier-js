import { hexToBin, range, splitEvery } from '../../../src/helpers/keyUtils';

describe('range function', function () {
  it('should return an array of incrementing values of length set by parameter', function () {
    expect(range(3)).toEqual([0, 1, 2]);
  });
});

describe('splitEvery function', function () {
  it('should return an array of strings made of chunks of the input string', function () {
    expect(splitEvery('abcdefg012345', 3))
      .toEqual(['abc', 'def', 'g01', '234', '5']);
  });
});

describe('hexToBin function', function () {
  it('should return a Uint8Array decoded from a hex-encoded string', function () {
    expect(hexToBin('0001022a646566ff'))
      .toEqual(Uint8Array.from([0, 1, 2, 42, 100, 101, 102, 255]));
  });
});
