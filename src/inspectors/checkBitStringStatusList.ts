import { request } from '@blockcerts/explorer-lookup';
// @ts-expect-error not a TS package
import { decodeList, type RevocationList } from '@digitalbazaar/vc-revocation-list';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import Certificate from '../certificate';
import { VERIFICATION_STATUSES } from '../constants/verificationStatuses';
import domain from '../domain';
import { CREDENTIAL_STATUS_OPTIONS } from '../domain/certificates/useCases/generateRevocationReason';
import type { BlockcertsV3, VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';

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

function assertCacheEntryShape (cacheEntry: any, cacheLocation: string): CachedStatusListCredentialEntry {
  if (!cacheEntry || typeof cacheEntry !== 'object' || !cacheEntry.credential || typeof cacheEntry.cachedAt !== 'number') {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${cacheLocation}.`);
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
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${statusListCredentialCacheUrl}.`);
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
  // dynamic imports: this branch is only reached server-side (Node), never bundled/executed for a browser
  // consumer, since statusListCredentialCacheUrl must be an HTTP URL in that context
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
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'invalidStatusListCacheResponse')} ${cacheFilePath}.`);
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
  try {
    const { mkdir, writeFile } = await import('fs/promises');
    const { dirname } = await import('path');

    const store = await readCacheStoreFile(cacheFilePath).catch(() => ({}));
    store[statusListUrl] = { credential, cachedAt: Date.now() };

    await mkdir(dirname(cacheFilePath), { recursive: true });
    await writeFile(cacheFilePath, JSON.stringify(store), 'utf-8');
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
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`);
  });

  if (statusList) {
    let revocationCredential: VerifiableCredential;
    try {
      revocationCredential = JSON.parse(statusList);
    } catch (e) {
      console.error(e);
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`);
    }

    if (statusListCredentialCacheUrl && typeof getTTL(revocationCredential) === 'number') {
      await cacheStatusListCredential(statusListCredentialCacheUrl, statusListUrl, revocationCredential);
    }

    return revocationCredential;
  }

  return statusList;
}

async function verifyRevocationCredential (revocationCredential: VerifiableCredential): Promise<void> {
  const certificate = new Certificate(revocationCredential as BlockcertsV3);
  await certificate.init();
  const result = await certificate.verify();

  if (result.status === VERIFICATION_STATUSES.FAILURE) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, domain.i18n.getText('revocation', 'revocationListAuthenticityFailure'));
  }
}

export default async function checkBitStringStatusList (credentialStatus: VCCredentialStatus | VCCredentialStatus[], options: CheckBitStringStatusListOptions = {}): Promise<void> {
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
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${status.statusListCredential}.`);
    }

    await verifyRevocationCredential(revocationCredential);

    const { encodedList } = revocationCredential.credentialSubject;
    const decodedList: RevocationList = await decodeList({ encodedList });

    if (decodedList.isRevoked(credentialIndex)) {
      const statusText = status.statusPurpose === 'revocation' ? CREDENTIAL_STATUS_OPTIONS.REVOKED : CREDENTIAL_STATUS_OPTIONS.SUSPENDED;
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, domain.certificates.generateRevocationReason('', statusText));
    }
  }
}
