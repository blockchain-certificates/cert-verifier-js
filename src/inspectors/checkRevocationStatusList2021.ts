import { request } from '@blockcerts/explorer-lookup';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { RevocationList } from 'vc-revocation-list';
import { decodeList } from 'vc-revocation-list';
import Verifier from '../verifier';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants/verificationSteps';
import type { VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';
import domain from '../domain';
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
  const issuerProfile = await domain.verifier.getIssuerProfile(revocationCredential.issuer);
  const verifier = new Verifier({
    certificateJson: revocationCredential as any,
    expires: '',
    hashlinkVerifier: new HashlinkVerifier(),
    id: revocationCredential.id,
    issuer: issuerProfile,
    revocationKey: '',
    explorerAPIs: null
  });
  await verifier.init();
  const revocationCredentialVerification = await verifier.verify();

  if (revocationCredentialVerification.status !== VERIFICATION_STATUSES.SUCCESS) {
    console.error(revocationCredentialVerification.message);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, 'The authenticity of the revocation list could not be verified.');
  }
}

export default async function checkRevocationStatusList2021 (credentialStatus: VCCredentialStatus): Promise<void> {
  // TODO: handle credentialStatus as an array
  const credentialIndex = parseInt(credentialStatus.statusListIndex, 10);
  const revocationCredential: VerifiableCredential = await getRevocationCredential(credentialStatus.statusListCredential);

  if (!revocationCredential) {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `No status list could be found at the specified URL for 'statusListCredential': ${credentialStatus.statusListCredential}.`);
  }

  await verifyRevocationCredential(revocationCredential);

  const { encodedList } = revocationCredential.credentialSubject;
  const decodedList: RevocationList = await decodeList({ encodedList });

  if (decodedList.isRevoked(credentialIndex)) {
    // TODO: i18n
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, 'Certificate has been revoked.');
  }
}
