import { describe, it, expect } from 'vitest';
import domain from '../../../../../src/domain';

describe('domain i18n getText use case test suite', function () {
  describe('given it is invoked without the group', function () {
    it('should return an empty string', function () {
      // @ts-expect-error test case
      const res = domain.i18n.getText();
      expect(res).toBe('');
    });
  });

  describe('given it is invoked without the item', function () {
    it('should return an error', function () {
      // @ts-expect-error test case
      const res = domain.i18n.getText('group');
      expect(res).toBe('');
    });
  });

  describe('given the current locale does not exist in the i18n data', function () {
    it('should return an error', function () {
      domain.i18n.setLocale('fr-FR');
      const res = domain.i18n.getText('group', 'item');
      expect(res).toBe('[missing locale data]');
      domain.i18n.setLocale('en-US');
    });
  });

  describe('given the group data does not exist in the i18n data', function () {
    it('should return an error', function () {
      const res = domain.i18n.getText('invalid-group', 'item');
      expect(res).toBe('[missing locale group data]');
    });
  });

  describe('given the item does not exist in the i18n data', function () {
    it('should return an error', function () {
      const res = domain.i18n.getText('errors', 'invalid-item');
      expect(res).toBe('[missing locale item data]');
    });
  });
});
