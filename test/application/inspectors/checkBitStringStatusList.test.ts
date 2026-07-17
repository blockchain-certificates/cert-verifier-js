import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { checkBitStringStatusList } from '../../../src/inspectors';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Revoked from '../../fixtures/v3/cert-rl-status-list-2021-revoked.json';
import StatusList2021Suspended from '../../fixtures/v3/cert-rl-status-list-2021-suspended.json';
import StatusList2021 from '../../fixtures/v3/cert-rl-status-list-2021.json';

const tamperedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--tampered.json';
const undefinedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--undefined.json';
const notFoundListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--not-found.json';

describe('checkBitStringStatusList inspector test suite', function () {
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
        await checkBitStringStatusList(StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('This certificate has been revoked by the issuer.');
    });
  });

  describe('when the certificate has been suspended', function () {
    it('should throw', async function () {
      await expect(async () => {
        await checkBitStringStatusList(StatusList2021Suspended.credentialStatus);
      }).rejects.toThrow('This certificate has been suspended by the issuer.');
    });
  });

  describe('when the certificate has not been revoked nor suspended', function () {
    it('should verify', async function () {
      let failed = false;

      try {
        await checkBitStringStatusList(StatusList2021.credentialStatus);
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
        await checkBitStringStatusList(tamperedList.credentialStatus);
      }).rejects.toThrow('The authenticity of the revocation list could not be verified.');
    });
  });

  describe('when no revocation list could be retrieved at the URL', function () {
    it('should throw', async function () {
      const undefinedList = JSON.parse(JSON.stringify(StatusList2021Revoked));
      undefinedList.credentialStatus.statusListCredential = undefinedListUrl;

      await expect(async () => {
        await checkBitStringStatusList(undefinedList.credentialStatus);
      }).rejects.toThrow(`No status list could be found at the specified URL for 'statusListCredential': ${undefinedListUrl}.`);
    });
  });

  describe('when the revocation list URL yields a 404 rejection', function () {
    it('should throw', async function () {
      const notFoundList = JSON.parse(JSON.stringify(StatusList2021Revoked));
      notFoundList.credentialStatus.statusListCredential = notFoundListUrl;

      await expect(async () => {
        await checkBitStringStatusList(notFoundList.credentialStatus);
      }).rejects.toThrow(`No status list could be found at the specified URL for 'statusListCredential': ${notFoundListUrl}.`);
    });
  });

  describe('when there are multiple non-revocation entries', function () {
    it('should report suspended when one of the suspension entries is active', async function () {
      const inactiveSuspensionEntry = {
        id: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json#0',
        type: 'StatusList2021Entry',
        statusPurpose: 'suspension',
        statusListIndex: '0',
        statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
      };
      const activeSuspensionEntry = {
        id: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json#12354',
        type: 'StatusList2021Entry',
        statusPurpose: 'suspension',
        statusListIndex: '12354',
        statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
      };

      await expect(async () => {
        await checkBitStringStatusList([inactiveSuspensionEntry, activeSuspensionEntry]);
      }).rejects.toThrow('This certificate has been suspended by the issuer.');
    });
  });

  describe('when the certificate is both revoked and suspended', function () {
    const revokedEntry = {
      id: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json#23547',
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: '23547',
      statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
    };
    const suspendedEntry = {
      id: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json#12354',
      type: 'StatusList2021Entry',
      statusPurpose: 'suspension',
      statusListIndex: '12354',
      statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
    };

    it('should report revoked when the revocation entry comes first', async function () {
      await expect(async () => {
        await checkBitStringStatusList([revokedEntry, suspendedEntry]);
      }).rejects.toThrow('This certificate has been revoked by the issuer.');
    });

    it('should report revoked when the suspension entry comes first', async function () {
      await expect(async () => {
        await checkBitStringStatusList([suspendedEntry, revokedEntry]);
      }).rejects.toThrow('This certificate has been revoked by the issuer.');
    });
  });
});
