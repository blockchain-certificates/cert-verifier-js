import { expect, describe, it } from 'vitest';
import { CONTEXT_URLS } from '@blockcerts/schemas';
import retrieveVCVersion from '../../../../src/parsers/helpers/retrieveVCVersion';

describe('retrieveVCVersion test suite', function () {
  describe('when the credential context is a v1', function () {
    it('should return version number 1', function () {
      const fixture = [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT, CONTEXT_URLS.BLOCKCERTS_V3_1_CONTEXT];
      expect(retrieveVCVersion(fixture)).toEqual({ versionNumber: 1 });
    });
  });

  describe('when the credential context is a v2', function () {
    it('should return version number 2', function () {
      const fixture = [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT, CONTEXT_URLS.BLOCKCERTS_V3_1_CONTEXT];
      expect(retrieveVCVersion(fixture)).toEqual({ versionNumber: 2 });
    });
  });

  describe('when the credential context is not a v1 or v2', function () {
    it('should return version number -1', function () {
      const fixture = [CONTEXT_URLS.BLOCKCERTS_V3_1_CONTEXT];
      expect(retrieveVCVersion(fixture)).toEqual({ versionNumber: -1 });
    });
  });

  describe('when the credential context is a string', function () {
    describe('and is a verifiable credential v1 context', function () {
      it('should return version number 1', function () {
        const fixture = CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT;
        expect(retrieveVCVersion(fixture)).toEqual({ versionNumber: 1 });
      });
    });
  });
});
