import type Versions from '../../../src/constants/certificateVersions';
import { isV1, isV3 } from '../../../src/constants/certificateVersions';

describe('certificateVersions test suite', function () {
  describe('isV1 method', function () {
    describe('when the version is 1.1', function () {
      it('should return true', function () {
        expect(isV1('1.1' as Versions)).toBe(true);
      });
    });

    describe('when the version is 1.2', function () {
      it('should return true', function () {
        expect(isV1('1.2' as Versions)).toBe(true);
      });
    });

    describe('when the version is something else', function () {
      it('should return false', function () {
        expect(isV1('2.0' as Versions)).toBe(false);
      });
    });
  });

  describe('isV3 method', function () {
    describe('when the version is 3.0-alpha', function () {
      it('should return true', function () {
        expect(isV3('3.0-alpha' as Versions)).toBe(true);
      });
    });

    describe('when the version is 3.0-beta', function () {
      it('should return true', function () {
        expect(isV3('3.0-beta' as Versions)).toBe(true);
      });
    });

    describe('when the version is something else', function () {
      it('should return false', function () {
        expect(isV3('2.0' as Versions)).toBe(false);
      });
    });
  });
});
