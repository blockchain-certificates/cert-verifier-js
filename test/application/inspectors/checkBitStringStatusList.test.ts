import { describe, it, expect, afterAll, afterEach, beforeEach, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { checkBitStringStatusList } from '../../../src/inspectors';
import Certificate from '../../../src/certificate';
import { VERIFICATION_STATUSES } from '../../../src/constants/verificationStatuses';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Revoked from '../../fixtures/v3/cert-rl-status-list-2021-revoked.json';
import StatusList2021Suspended from '../../fixtures/v3/cert-rl-status-list-2021-suspended.json';
import StatusList2021 from '../../fixtures/v3/cert-rl-status-list-2021.json';

vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
  const explorerLookup = await importOriginal();
  return {
    ...explorerLookup,
    request: async function ({ url, method, body }) {
      if (url.startsWith(cacheServiceUrl)) {
        return await handleCacheServiceRequest({ url, method, body });
      }

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

      if (url === withTtlListUrl) {
        withTtlListFetchCount++;
        return JSON.stringify(withTtlCredential);
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

const tamperedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--tampered.json';
const undefinedListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--undefined.json';
const notFoundListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--not-found.json';
const withTtlListUrl = 'https://www.blockcerts.org/samples/3.0/status-list-2021--with-ttl.json';
const withTtlCredential = {
  ...BlockcertsStatusList2021,
  credentialSubject: {
    ...BlockcertsStatusList2021.credentialSubject,
    ttl: 60000 // 1 minute
  }
};

const cacheServiceUrl = 'https://cache.example.com/status-list-cache?token=secret-token';
const cacheServiceRequests: Array<{ url: string; method?: string; body?: any }> = [];
let cacheServiceStore = new Map<string, { credential: any; cachedAt: number }>();
let withTtlListFetchCount = 0;
let cacheServiceGetResponseOverride: string | undefined;

async function handleCacheServiceRequest ({ url, method, body }: { url: string; method?: string; body?: any }): Promise<string | undefined> {
  cacheServiceRequests.push({ url, method, body });

  if (!method || method === 'GET') {
    if (cacheServiceGetResponseOverride !== undefined) {
      return cacheServiceGetResponseOverride;
    }

    const targetUrl = new URL(url).searchParams.get('url');
    const cacheEntry = cacheServiceStore.get(targetUrl);
    return cacheEntry ? JSON.stringify(cacheEntry) : undefined;
  }

  if (method === 'POST') {
    const payload = JSON.parse(body);
    cacheServiceStore.set(payload.url, { credential: payload.credential, cachedAt: payload.cachedAt });
    return undefined;
  }

  return undefined;
}


describe('checkBitStringStatusList inspector test suite', function () {
  afterAll(function () {
    vi.restoreAllMocks();
  });

  beforeEach(function () {
    cacheServiceRequests.length = 0;
    cacheServiceStore = new Map();
    withTtlListFetchCount = 0;
    cacheServiceGetResponseOverride = undefined;
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

  describe('when a statusListCredentialCacheUrl is provided', function () {
    let verifySpy: any;
    let initSpy: any;

    beforeEach(function () {
      // adding a `ttl` to a cloned fixture invalidates its original proof; authenticity verification
      // itself is already covered by the other test suites in this file, so it is stubbed here to
      // isolate the caching/ttl logic under test.
      initSpy = vi.spyOn(Certificate.prototype, 'init').mockResolvedValue(undefined);
      verifySpy = vi.spyOn(Certificate.prototype, 'verify').mockResolvedValue({
        status: VERIFICATION_STATUSES.SUCCESS
      } as any);
    });

    afterEach(function () {
      initSpy.mockRestore();
      verifySpy.mockRestore();
    });

    const noTtlEntry = {
      id: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json#23546',
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: '23546',
      statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
    };

    const cacheableEntry = {
      id: `${withTtlListUrl}#23546`,
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: '23546',
      statusListCredential: withTtlListUrl
    };

    describe('and the option is not set', function () {
      it('should never contact the caching service', async function () {
        await checkBitStringStatusList(cacheableEntry);
        expect(cacheServiceRequests.length).toBe(0);
      });
    });

    describe('and the status list credential has no ttl', function () {
      it('should not write to the cache', async function () {
        await checkBitStringStatusList(noTtlEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        const writeRequests = cacheServiceRequests.filter(r => r.method === 'POST');
        expect(writeRequests.length).toBe(0);
      });

      it('should preserve existing query params (e.g. an auth token) on the cache read request', async function () {
        await checkBitStringStatusList(noTtlEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        const readRequest = cacheServiceRequests.find(r => !r.method || r.method === 'GET');
        expect(new URL(readRequest.url).searchParams.get('token')).toBe('secret-token');
      });
    });

    describe('and the status list credential has a ttl', function () {
      it('should write a fresh fetch to the cache', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        const writeRequests = cacheServiceRequests.filter(r => r.method === 'POST');
        expect(writeRequests.length).toBe(1);
        const payload = JSON.parse(writeRequests[0].body);
        expect(payload.url).toBe(withTtlListUrl);
        expect(payload.credential.credentialSubject.ttl).toBe(60000);
        expect(typeof payload.cachedAt).toBe('number');
      });

      it('should serve subsequent calls within the ttl window from the cache without refetching', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });
        withTtlListFetchCount = 0;
        cacheServiceRequests.length = 0;

        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        expect(withTtlListFetchCount).toBe(0);
        expect(cacheServiceRequests.some(r => !r.method || r.method === 'GET')).toBe(true);
        expect(cacheServiceRequests.some(r => r.method === 'POST')).toBe(false);
      });

      it('should refetch and re-cache once the cached entry has expired', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        // simulate the cached entry having expired
        const cacheEntry = cacheServiceStore.get(withTtlListUrl);
        cacheEntry.cachedAt = Date.now() - 120000; // 2 minutes ago, ttl is 60s
        cacheServiceStore.set(withTtlListUrl, cacheEntry);

        withTtlListFetchCount = 0;

        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });

        expect(withTtlListFetchCount).toBe(1);
      });
    });

    describe('and the caching service returns a response that does not match the expected contract', function () {
      it('should not throw when the caching service reports no cache entry (empty response)', async function () {
        cacheServiceGetResponseOverride = undefined;

        await expect(
          checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl })
        ).resolves.toBeUndefined();
      });

      it('should throw when the caching service response is not valid JSON', async function () {
        cacheServiceGetResponseOverride = 'not-json';

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheServiceUrl}.`);
      });

      it('should throw when the caching service response is missing the credential property', async function () {
        cacheServiceGetResponseOverride = JSON.stringify({ cachedAt: Date.now() });

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheServiceUrl}.`);
      });

      it('should throw when the caching service response has a non-numeric cachedAt property', async function () {
        cacheServiceGetResponseOverride = JSON.stringify({ credential: withTtlCredential, cachedAt: 'yesterday' });

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheServiceUrl });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheServiceUrl}.`);
      });
    });
  });

  describe('when a statusListCredentialCacheUrl is provided as a filesystem path', function () {
    let verifySpy: any;
    let initSpy: any;
    let cacheDir: string;
    let cacheFilePath: string;

    const noTtlEntry = {
      id: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json#23546',
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: '23546',
      statusListCredential: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
    };

    const cacheableEntry = {
      id: `${withTtlListUrl}#23546`,
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: '23546',
      statusListCredential: withTtlListUrl
    };

    beforeEach(async function () {
      initSpy = vi.spyOn(Certificate.prototype, 'init').mockResolvedValue(undefined);
      verifySpy = vi.spyOn(Certificate.prototype, 'verify').mockResolvedValue({
        status: VERIFICATION_STATUSES.SUCCESS
      } as any);

      cacheDir = await mkdtemp(join(tmpdir(), 'cert-verifier-js-status-list-cache-'));
      cacheFilePath = join(cacheDir, 'status-list-cache.json');
      withTtlListFetchCount = 0;
    });

    afterEach(async function () {
      initSpy.mockRestore();
      verifySpy.mockRestore();
      await rm(cacheDir, { recursive: true, force: true });
    });

    describe('and the option is not set', function () {
      it('should never write a cache file', async function () {
        await checkBitStringStatusList(cacheableEntry);

        await expect(readFile(cacheFilePath, 'utf-8')).rejects.toThrow();
      });
    });

    describe('and the status list credential has no ttl', function () {
      it('should not write to the cache', async function () {
        await checkBitStringStatusList(noTtlEntry, { statusListCredentialCacheUrl: cacheFilePath });

        await expect(readFile(cacheFilePath, 'utf-8')).rejects.toThrow();
      });
    });

    describe('and the status list credential has a ttl', function () {
      it('should write a fresh fetch to the cache file, keyed by url, shaped as { cachedAt, credential }', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });

        const store = JSON.parse(await readFile(cacheFilePath, 'utf-8'));
        expect(Object.keys(store)).toEqual([withTtlListUrl]);
        expect(store[withTtlListUrl].credential.credentialSubject.ttl).toBe(60000);
        expect(typeof store[withTtlListUrl].cachedAt).toBe('number');
      });

      it('should create intermediate directories for the cache file path if missing', async function () {
        const nestedCacheFilePath = join(cacheDir, 'nested', 'dir', 'status-list-cache.json');

        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: nestedCacheFilePath });

        const store = JSON.parse(await readFile(nestedCacheFilePath, 'utf-8'));
        expect(store[withTtlListUrl].credential.credentialSubject.ttl).toBe(60000);
      });

      it('should serve subsequent calls within the ttl window from the cache without refetching', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });
        withTtlListFetchCount = 0;

        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });

        expect(withTtlListFetchCount).toBe(0);
      });

      it('should refetch and re-cache once the cached entry has expired', async function () {
        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });

        const store = JSON.parse(await readFile(cacheFilePath, 'utf-8'));
        store[withTtlListUrl].cachedAt = Date.now() - 120000; // 2 minutes ago, ttl is 60s
        await writeFile(cacheFilePath, JSON.stringify(store), 'utf-8');

        withTtlListFetchCount = 0;

        await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });

        expect(withTtlListFetchCount).toBe(1);
      });
    });

    describe('and the cache file does not match the expected contract', function () {
      it('should not throw when no cache file has been written yet', async function () {
        await expect(
          checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath })
        ).resolves.toBeUndefined();
      });

      it('should throw when the cache file does not contain valid JSON', async function () {
        await mkdir(cacheDir, { recursive: true });
        await writeFile(cacheFilePath, 'not-json', 'utf-8');

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheFilePath}.`);
      });

      it('should throw when the cache entry for the url is missing the credential property', async function () {
        await writeFile(cacheFilePath, JSON.stringify({ [withTtlListUrl]: { cachedAt: Date.now() } }), 'utf-8');

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheFilePath}.`);
      });

      it('should throw when the cache entry for the url has a non-numeric cachedAt property', async function () {
        await writeFile(cacheFilePath, JSON.stringify({ [withTtlListUrl]: { credential: withTtlCredential, cachedAt: 'yesterday' } }), 'utf-8');

        await expect(async () => {
          await checkBitStringStatusList(cacheableEntry, { statusListCredentialCacheUrl: cacheFilePath });
        }).rejects.toThrow(`The status list cache service response does not match the expected format for URL: ${cacheFilePath}.`);
      });
    });
  });
});
