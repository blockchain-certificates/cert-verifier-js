import { request } from '@blockcerts/explorer-lookup';
import type { RevocationList } from '@digitalbazaar/vc-revocation-list';
import { decodeList } from '@digitalbazaar/vc-revocation-list';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants/verificationSteps';
import Certificate from '../certificate';
import type { BlockcertsV3, VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';
import { VERIFICATION_STATUSES } from '../constants/verificationStatuses';

async function getRevocationCredential (statusListUrl: string): Promise<VerifiableCredential> {
  const statusList = await request({
    url: statusListUrl
  });

  if (statusList) {
    try {
      return JSON.parse(statusList);
    } catch (e) {
      console.error(e);
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `No status list could be found at the specified URL for 'statusListCredential': ${statusListUrl}`);
    }
  }

  return statusList;
}

async function verifyRevocationCredential (revocationCredential: VerifiableCredential): Promise<void> {
  const certificate = new Certificate(revocationCredential as BlockcertsV3);
  await certificate.init();
  const result = await certificate.verify();

  if (result.status === VERIFICATION_STATUSES.FAILURE) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, 'The authenticity of the revocation list could not be verified.');
  }
}

export default async function checkRevocationStatusList2021 (credentialStatus: VCCredentialStatus | VCCredentialStatus[]): Promise<void> {
  if (!Array.isArray(credentialStatus)) {
    credentialStatus = [credentialStatus];
  }

  for (const status of credentialStatus) {
    const credentialIndex = parseInt(status.statusListIndex, 10);
    const revocationCredential: VerifiableCredential = await getRevocationCredential(status.statusListCredential);

    if (!revocationCredential) {
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `No status list could be found at the specified URL for 'statusListCredential': ${status.statusListCredential}.`);
    }

    await verifyRevocationCredential(revocationCredential);

    const { encodedList } = revocationCredential.credentialSubject;
    const decodedList: RevocationList = await decodeList({ encodedList });

    if (decodedList.isRevoked(credentialIndex)) {
      // TODO: i18n
      const statusText = status.statusPurpose === 'revocation' ? 'revoked' : 'suspended'; // TODO use enum
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `Certificate has been ${statusText}.`);
    }
  }
}
