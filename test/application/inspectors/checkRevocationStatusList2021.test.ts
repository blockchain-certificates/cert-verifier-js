import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { checkRevocationStatusList2021 } from '../../../src/inspectors';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Revoked from '../../fixtures/v3/cert-rl-status-list-2021-revoked.json';
import StatusList2021Suspended from '../../fixtures/v3/cert-rl-status-list-2021-suspended.json';
import StatusList2021 from '../../fixtures/v3/cert-rl-status-list-2021.json';

const tamperedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--tampered.json';
const undefinedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--undefined.json';
const notFoundListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--not-found.json';

describe('checkRevocationStatusList2021 inspector test suite', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/status-list-2021.json') {
            return JSON.stringify(BlockcertsStatusList2021);
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json') {
            return JSON.stringify(BlockcertsStatusList2021Suspension);
          }

          if (url === tamperedListUrl) {
            return JSON.stringify({
              ...BlockcertsStatusList2021,
              credentialSubject: {
                encodedList: 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA'
              }
            });
          }

          if (url === undefinedListUrl) {
            return undefined;
          }

          if (url === notFoundListUrl) {
            return await Promise.reject(new Error('Error fetching url:' + url + '; status code:404'));
          }
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  describe('when the certificate has been revoked', function () {
    it('should throw', async function () {
      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('This certificate has been revoked by the issuer.');
    });
  });

  describe('when the certificate has been suspended', function () {
    it('should throw', async function () {
      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Suspended.credentialStatus);
      }).rejects.toThrow('This certificate has been suspended by the issuer.');
    });
  });

  describe('when the certificate has not been revoked nor suspended', function () {
    it('should verify', async function () {
      let failed = false;

      try {
        await checkRevocationStatusList2021(StatusList2021.credentialStatus);
      } catch {
        failed = true;
      }

      expect(failed).toBe(false);
    });
  });

  describe('when the revocation list has been tampered with', function () {
    it('should throw', async function () {
      const tamperedList = JSON.parse(JSON.stringify(StatusList2021Revoked));
      tamperedList.credentialStatus.statusListCredential = tamperedListUrl;

      await expect(async () => {
        await checkRevocationStatusList2021(tamperedList.credentialStatus);
      }).rejects.toThrow('The authenticity of the revocation list could not be verified.');
    });
  });

  describe('when no revocation list could be retrieved at the URL', function () {
    it('should throw', async function () {
      const undefinedList = JSON.parse(JSON.stringify(StatusList2021Revoked));
      undefinedList.credentialStatus.statusListCredential = undefinedListUrl;

      await expect(async () => {
        await checkRevocationStatusList2021(undefinedList.credentialStatus);
      }).rejects.toThrow(`No status list could be found at the specified URL for 'statusListCredential': ${undefinedListUrl}.`);
    });
  });

  describe('when the revocation list URL yields a 404 rejection', function () {
    it('should throw', async function () {
      const notFoundList = JSON.parse(JSON.stringify(StatusList2021Revoked));
      notFoundList.credentialStatus.statusListCredential = notFoundListUrl;

      await expect(async () => {
        await checkRevocationStatusList2021(notFoundList.credentialStatus);
      }).rejects.toThrow(`No status list could be found at the specified URL for 'statusListCredential': ${notFoundListUrl}.`);
    });
  });
});
