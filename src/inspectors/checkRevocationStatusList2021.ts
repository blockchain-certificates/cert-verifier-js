import { request } from '@blockcerts/explorer-lookup';
import { decodeList } from '@digitalbazaar/vc-revocation-list';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import Certificate from '../certificate';
import { VERIFICATION_STATUSES } from '../constants/verificationStatuses';
import domain from '../domain';
import { CREDENTIAL_STATUS_OPTIONS } from '../domain/certificates/useCases/generateRevocationReason';
import type { BlockcertsV3, VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';
import type { RevocationList } from '@digitalbazaar/vc-revocation-list';

async function getRevocationCredential (statusListUrl: string): Promise<VerifiableCredential> {
  const statusList = await request({
    url: statusListUrl
  }).catch(e => {
    console.error(e);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`);
  });

  if (statusList) {
    try {
      return JSON.parse(statusList);
    } catch (e) {
      console.error(e);
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, `${domain.i18n.getText('revocation', 'noRevocationStatusList2021Found')} ${statusListUrl}.`);
    }
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

export default async function checkRevocationStatusList2021 (credentialStatus: VCCredentialStatus | VCCredentialStatus[]): Promise<void> {
  if (!Array.isArray(credentialStatus)) {
    credentialStatus = [credentialStatus];
  }

  for (const status of credentialStatus) {
    const credentialIndex = parseInt(status.statusListIndex, 10);
    const revocationCredential: VerifiableCredential = await getRevocationCredential(status.statusListCredential);

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
