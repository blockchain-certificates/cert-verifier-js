import { describe, it, expect } from 'vitest';
import { deepCopy, isObject } from '../../../src/helpers/object';

describe('deepCopy method', function () {
  it('should copy the object without reference', function () {
    const fixtureObject = { key: 'value' };
    const fixtureObjectDeepCopy = { key: 'value' };
    const result = deepCopy<Record<string, unknown>>(fixtureObject);
    fixtureObject.key = 'updated value';
    expect(result).toEqual(fixtureObjectDeepCopy);
  });
});

describe('isObject method', function () {
  describe('given the candidate is a string', function () {
    it('should return false', function () {
      const candidate = 'yo';
      expect(isObject(candidate)).toBe(false);
    });
  });

  describe('given the candidate is a number', function () {
    it('should return false', function () {
      const candidate = 3;
      expect(isObject(candidate)).toBe(false);
    });
  });

  describe('given the candidate is a boolean', function () {
    it('should return false', function () {
      const candidate = true;
      expect(isObject(candidate)).toBe(false);
    });
  });

  describe('given the candidate is null', function () {
    it('should return false', function () {
      const candidate = null;
      expect(isObject(candidate)).toBe(false);
    });
  });

  describe('given the candidate is a function', function () {
    it('should return true', function () {
      const candidate = function (): string { return 'yo'; };
      expect(isObject(candidate)).toBe(true);
    });
  });

  describe('given the candidate is an object', function () {
    it('should return true', function () {
      const candidate = {
        test: 'yo'
      };
      expect(isObject(candidate)).toBe(true);
    });
  });

  describe('given the candidate is an array', function () {
    it('should return true', function () {
      const candidate = ['yo'];
      expect(isObject(candidate)).toBe(true);
    });
  });
});
