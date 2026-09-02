import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../models';
import { ProblemDetailsType } from '../models/ProblemDetails';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import Certificate from '../certificate';
import { VERIFICATION_STATUSES } from '../constants/verificationStatuses';
import domain from '../domain';
import { CREDENTIAL_STATUS_OPTIONS } from '../domain/certificates/useCases/generateRevocationReason';
import type { BlockcertsV3, VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';

// per https://www.w3.org/TR/vc-bitstring-status-list/#validate-algorithm
const MINIMUM_STATUS_LIST_LENGTH = 131072;

// credentialStatus.type value defined by https://www.w3.org/TR/vc-bitstring-status-list/
const BITSTRING_STATUS_LIST_ENTRY_TYPE = 'BitstringStatusListEntry';

export interface CheckBitStringStatusListOptions {
  // HTTP URL of a caching service, or a relative filesystem path to a JSON cache file, used to store/retrieve
  // status list credentials between verifications
  statusListCredentialCacheUrl?: string;
}

interface CachedStatusListCredentialEntry {
  credential: VerifiableCredential;
  cachedAt: number; // ms epoch, time at which the credential was written to the cache
}

// a single JSON object keyed by status list credential url, so both the HTTP and filesystem
// caching strategies persist/exchange data under the same shape: { [url]: { cachedAt, credential } }
type StatusListCredentialCacheStore = Record<string, CachedStatusListCredentialEntry>;

function getTTL (credential: VerifiableCredential): number | undefined {
  // per https://www.w3.org/TR/vc-bitstring-status-list/#bitstringstatuslistcredential
  // ttl is expressed in milliseconds and lives on the credentialSubject of the status list credential
  const ttl = credential?.credentialSubject?.ttl;
  return typeof ttl === 'number' ? ttl : undefined;
}

function isCacheEntryFresh (cacheEntry: CachedStatusListCredentialEntry): boolean {
  const ttl = getTTL(cacheEntry.credential);
  if (typeof ttl !== 'number') {
    return false;
  }
  return (Date.now() - cacheEntry.cachedAt) < ttl;
}

function isHttpCacheUrl (statusListCredentialCacheUrl: string): boolean {
  return /^https?:\/\//i.test(statusListCredentialCacheUrl);
}

function isNodeEnvironment (): boolean {
  // process.versions.node is only populated in a genuine Node.js runtime; bundlers/polyfills used for
  // browser builds do not provide it, giving a reliable, dependency-free way to detect the environment
  // before attempting a dynamic `fs/promises` import
  return typeof process !== 'undefined' && !!process.versions?.node;
}

function assertFsCacheSupported (cacheFilePath: string): void {
  if (!isNodeEnvironment()) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'filesystemCacheUnsupported')} ${cacheFilePath}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
  }
}

function redactCacheLocationForError (cacheLocation: string): string {
  // statusListCredentialCacheUrl may embed an auth token as a query param (per README guidance);
  // strip query string/fragment from HTTP(S) URLs before surfacing them in thrown error messages
  // so secrets don't leak into VerifierError messages/downstream logs. Filesystem paths have no
  // query/fragment semantics and are left untouched.
  if (!isHttpCacheUrl(cacheLocation)) {
    return cacheLocation;
  }
  try {
    const url = new URL(cacheLocation);
    return `${url.origin}${url.pathname}`;
  } catch (e) {
    return cacheLocation;
  }
}

function assertCacheEntryShape (cacheEntry: any, cacheLocation: string): CachedStatusListCredentialEntry {
  if (!cacheEntry || typeof cacheEntry !== 'object' || !cacheEntry.credential || typeof cacheEntry.cachedAt !== 'number') {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${redactCacheLocationForError(cacheLocation)}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
  }
  return cacheEntry;
}

function buildCacheReadUrl (statusListCredentialCacheUrl: string, statusListUrl: string): string {
  // preserves any query params already present on statusListCredentialCacheUrl (e.g. an auth token),
  // appending the target `url` param with `&` rather than assuming `?` is safe to prepend
  const cacheUrl = new URL(statusListCredentialCacheUrl);
  cacheUrl.searchParams.set('url', statusListUrl);
  return cacheUrl.toString();
}

async function getCachedStatusListCredentialFromHttp (statusListCredentialCacheUrl: string, statusListUrl: string): Promise<CachedStatusListCredentialEntry | undefined> {
  let response: any;
  try {
    response = await request({
      url: buildCacheReadUrl(statusListCredentialCacheUrl, statusListUrl)
    });
  } catch (e) {
    // an unreachable cache service should not block verification, fall back to fetching the document
    console.error(e);
    return undefined;
  }

  if (!response) {
    // no cache entry found for this status list url; this is a valid cache miss, not a contract violation
    return undefined;
  }

  let cacheEntry: any;
  try {
    cacheEntry = JSON.parse(response);
  } catch (e) {
    console.error(e);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${redactCacheLocationForError(statusListCredentialCacheUrl)}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
  }

  return assertCacheEntryShape(cacheEntry, statusListCredentialCacheUrl);
}

async function cacheStatusListCredentialToHttp (statusListCredentialCacheUrl: string, statusListUrl: string, credential: VerifiableCredential): Promise<void> {
  try {
    await request({
      url: statusListCredentialCacheUrl,
      method: 'POST',
      body: JSON.stringify({ url: statusListUrl, credential, cachedAt: Date.now() })
    });
  } catch (e) {
    console.error(e);
  }
}

async function readCacheStoreFile (cacheFilePath: string): Promise<StatusListCredentialCacheStore> {
  // guard against a misconfigured browser consumer passing a filesystem path instead of an HTTP URL:
  // fail loudly with a clear library error rather than a confusing module-resolution/runtime failure
  // from the dynamic `fs/promises` import below
  assertFsCacheSupported(cacheFilePath);
  const { readFile } = await import('fs/promises');

  let raw: string;
  try {
    raw = await readFile(cacheFilePath, 'utf-8');
  } catch (e: any) {
    if (e?.code === 'ENOENT') {
      // no cache file written yet, this is a valid empty store, not a contract violation
      return {};
    }
    throw e;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${cacheFilePath}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
  }
}

async function getCachedStatusListCredentialFromFs (cacheFilePath: string, statusListUrl: string): Promise<CachedStatusListCredentialEntry | undefined> {
  let store: StatusListCredentialCacheStore;
  try {
    store = await readCacheStoreFile(cacheFilePath);
  } catch (e) {
    if (e instanceof VerifierError) {
      throw e;
    }
    // an unreadable cache file (e.g. permissions) should not block verification, fall back to fetching the document
    console.error(e);
    return undefined;
  }

  const cacheEntry = store[statusListUrl];
  if (cacheEntry === undefined) {
    // no cache entry found for this status list url; this is a valid cache miss, not a contract violation
    return undefined;
  }

  return assertCacheEntryShape(cacheEntry, cacheFilePath);
}

async function cacheStatusListCredentialToFs (cacheFilePath: string, statusListUrl: string, credential: VerifiableCredential): Promise<void> {
  assertFsCacheSupported(cacheFilePath);
  try {
    const { mkdir, writeFile } = await import('fs/promises');
    const { dirname } = await import('path');

    const store = await readCacheStoreFile(cacheFilePath).catch((e) => {
      if (e instanceof VerifierError) {
        throw e;
      }
      return {};
    });
    store[statusListUrl] = { credential, cachedAt: Date.now() };

    await mkdir(dirname(cacheFilePath), { recursive: true });
    await writeFile(cacheFilePath, JSON.stringify(store), 'utf-8');
  } catch (e) {
    if (e instanceof VerifierError) {
      throw e;
    }
    console.error(e);
  }
}

async function cleanupExpiredFsCacheEntries (cacheFilePath: string): Promise<void> {
  assertFsCacheSupported(cacheFilePath);
  let store: StatusListCredentialCacheStore;
  try {
    store = await readCacheStoreFile(cacheFilePath);
  } catch (e) {
    // a malformed cache file is a contract violation surfaced by regular read/write paths;
    // cleanup itself should not block verification, so just skip pruning here
    console.error(e);
    return;
  }

  let hasRemovedEntries = false;
  const prunedStore: StatusListCredentialCacheStore = {};
  for (const [url, cacheEntry] of Object.entries(store)) {
    // entries that don't conform to the expected shape (e.g. non-numeric cachedAt) are left untouched here;
    // it is not this cleanup pass's responsibility to enforce/report the cache contract, that is done
    // by assertCacheEntryShape() when the entry is actually read for use
    const isWellFormed = !!cacheEntry && typeof cacheEntry.cachedAt === 'number' && !!cacheEntry.credential;
    // entries without a resolvable ttl are left untouched, there is no basis on which to consider them expired
    const ttl = isWellFormed ? getTTL(cacheEntry.credential) : undefined;
    if (!isWellFormed || typeof ttl !== 'number' || (Date.now() - cacheEntry.cachedAt) < ttl) {
      prunedStore[url] = cacheEntry;
    } else {
      hasRemovedEntries = true;
    }
  }

  if (!hasRemovedEntries) {
    return;
  }

  try {
    const { writeFile } = await import('fs/promises');
    await writeFile(cacheFilePath, JSON.stringify(prunedStore), 'utf-8');
  } catch (e) {
    console.error(e);
  }
}

async function getCachedStatusListCredential (statusListCredentialCacheUrl: string, statusListUrl: string): Promise<CachedStatusListCredentialEntry | undefined> {
  if (isHttpCacheUrl(statusListCredentialCacheUrl)) {
    return await getCachedStatusListCredentialFromHttp(statusListCredentialCacheUrl, statusListUrl);
  }
  return await getCachedStatusListCredentialFromFs(statusListCredentialCacheUrl, statusListUrl);
}

async function cacheStatusListCredential (statusListCredentialCacheUrl: string, statusListUrl: string, credential: VerifiableCredential): Promise<void> {
  if (isHttpCacheUrl(statusListCredentialCacheUrl)) {
    await cacheStatusListCredentialToHttp(statusListCredentialCacheUrl, statusListUrl, credential);
    return;
  }
  await cacheStatusListCredentialToFs(statusListCredentialCacheUrl, statusListUrl, credential);
}

async function getRevocationCredential (statusListUrl: string, statusListCredentialCacheUrl?: string): Promise<VerifiableCredential> {
  if (statusListCredentialCacheUrl) {
    const cacheEntry = await getCachedStatusListCredential(statusListCredentialCacheUrl, statusListUrl);
    if (cacheEntry && isCacheEntryFresh(cacheEntry)) {
      return cacheEntry.credential;
    }
  }

  const statusList = await request({
    url: statusListUrl
  }).catch(e => {
    console.error(e);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
  });

  if (statusList) {
    let revocationCredential: VerifiableCredential;
    try {
      revocationCredential = JSON.parse(statusList);
    } catch (e) {
      console.error(e);
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
    }

    if (statusListCredentialCacheUrl && typeof getTTL(revocationCredential) === 'number') {
      await cacheStatusListCredential(statusListCredentialCacheUrl, statusListUrl, revocationCredential);
    }

    return revocationCredential;
  }

  return statusList;
}

// credentialStatus.type value defined by https://www.w3.org/TR/vc-bitstring-status-list/; its encodedList
// is multibase-encoded (leading "u") and must be decoded via @digitalbazaar/vc-bitstring-status-list.
// Legacy status lists (RevocationList2020, StatusList2021) are not multibase-encoded and are decoded via
// the older @digitalbazaar/vc-revocation-list package instead. The package is dynamically imported based
// on the credentialStatus type so consumers only load the implementation they actually need. The two
// import() calls use literal specifiers (rather than a single call with a variable specifier) so that
// bundlers (e.g. Rollup, including the IIFE build with inlineDynamicImports) can statically analyze and
// inline both dependencies.
async function decodeStatusList (credentialStatusType: string, encodedList: string): Promise<{ length: number, isSet: (index: number) => boolean }> {
  let decodeList: any;
  if (credentialStatusType === BITSTRING_STATUS_LIST_ENTRY_TYPE) {
    // @ts-expect-error not a TS package
    ({ decodeList } = await import('@digitalbazaar/vc-bitstring-status-list'));
  } else {
    // @ts-expect-error not a TS package
    ({ decodeList } = await import('@digitalbazaar/vc-revocation-list'));
  }
  const decodedList = await decodeList({ encodedList });
  // both RevocationList and BitstringStatusList wrap a @digitalbazaar/bitstring instance under `bitstring`,
  // so status/revocation lookup can be read consistently regardless of which package decoded the list
  return { length: decodedList.length, isSet: (index: number) => decodedList.bitstring.get(index) };
}


async function verifyRevocationCredential (revocationCredential: VerifiableCredential): Promise<void> {
  const certificate = new Certificate(revocationCredential as BlockcertsV3);
  await certificate.init();
  const result = await certificate.verify();

  if (result.status === VERIFICATION_STATUSES.FAILURE) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, domain.i18n.getText('revocation', 'revocationListAuthenticityFailure'), ProblemDetailsType.STATUS_VERIFICATION_ERROR);
  }
}

export default async function checkBitStringStatusList (credentialStatus: VCCredentialStatus | VCCredentialStatus[], options: CheckBitStringStatusListOptions = {}): Promise<void> {
  const { statusListCredentialCacheUrl } = options;
  if (statusListCredentialCacheUrl && !isHttpCacheUrl(statusListCredentialCacheUrl)) {
    // HTTP caching services are expected to manage their own garbage collection; only the filesystem
    // cache is pruned here, since this library is the sole owner/writer of that cache file
    await cleanupExpiredFsCacheEntries(statusListCredentialCacheUrl);
  }

  if (!Array.isArray(credentialStatus)) {
    credentialStatus = [credentialStatus];
  }

  credentialStatus = [...credentialStatus].sort((a, b) => {
    if (a.statusPurpose === 'revocation') return -1;
    if (b.statusPurpose === 'revocation') return 1;
    return 0;
  });

  for (const status of credentialStatus) {
    const credentialIndex = parseInt(status.statusListIndex, 10);
    const revocationCredential: VerifiableCredential = await getRevocationCredential(status.statusListCredential, options.statusListCredentialCacheUrl);

    if (!revocationCredential) {
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${status.statusListCredential}.`, ProblemDetailsType.STATUS_RETRIEVAL_ERROR);
    }

    await verifyRevocationCredential(revocationCredential);

    const { encodedList } = revocationCredential.credentialSubject;
    const decodedList = await decodeStatusList(status.type, encodedList);

    if (decodedList.length < MINIMUM_STATUS_LIST_LENGTH) {
      throw new VerifierError(
        SUB_STEPS.checkRevokedStatus,
        `${domain.i18n.getText('revocation', 'statusListLengthError')} (${decodedList.length} < ${MINIMUM_STATUS_LIST_LENGTH}).`,
        ProblemDetailsType.STATUS_LIST_LENGTH_ERROR
      );
    }

    let isRevoked: boolean;
    try {
      if (!Number.isInteger(credentialIndex) || credentialIndex < 0) {
        throw new Error(`statusListIndex "${status.statusListIndex}" is not a valid non-negative integer.`);
      }
      isRevoked = decodedList.isSet(credentialIndex);
    } catch (e) {
      throw new VerifierError(
        SUB_STEPS.checkRevokedStatus,
        `${domain.i18n.getText('revocation', 'statusListIndexOutOfRange')} (${e.message})`,
        ProblemDetailsType.RANGE_ERROR
      );
    }

    if (isRevoked) {
      const statusText = status.statusPurpose === 'revocation' ? CREDENTIAL_STATUS_OPTIONS.REVOKED : CREDENTIAL_STATUS_OPTIONS.SUSPENDED;
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, domain.certificates.generateRevocationReason('', statusText));
    }
  }
}
