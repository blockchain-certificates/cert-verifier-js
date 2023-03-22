import type { VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';
import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants/verificationSteps';
import { decodeList } from 'vc-revocation-list';
import type { RevocationList } from 'vc-revocation-list';

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

export default async function checkRevocationStatusList2021 (credentialStatus: VCCredentialStatus): Promise<void> {
  const credentialIndex = parseInt(credentialStatus.statusListIndex, 10);
  const revocationCredential: VerifiableCredential = await getRevocationCredential(credentialStatus.statusListCredential);

  if (!revocationCredential) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `No status list could be found at the specified URL for 'statusListCredential': ${credentialStatus.statusListCredential}`);
  }

  // TODO: verify revocationCredential

  const { encodedList } = revocationCredential.credentialSubject;
  const decodedList: RevocationList = await decodeList({ encodedList });

  if (decodedList.isRevoked(credentialIndex)) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, 'Certificate has been revoked');
  }
}
