import { request } from '@blockcerts/explorer-lookup';
import type { RevocationList } from '@digitalbazaar/vc-revocation-list';
import { decodeList } from '@digitalbazaar/vc-revocation-list';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants/verificationSteps';
import domain from '../domain';
import type { VCCredentialStatus, VerifiableCredential } from '../models/BlockcertsV3';
import type { SuiteAPI, Suite } from '../models/Suite';

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

async function getVerificationSuiteForProof (type: string): Promise<Suite> {
  if (type === 'Ed25519Signature2020') {
    const { default: suite } = await import('../suites/Ed25519Signature2020');
    return suite as unknown as Suite;
  }

  if (type === 'EcdsaSecp256k1Signature2019') {
    const { default: suite } = await import('../suites/EcdsaSecp256k1Signature2019');
    return suite as unknown as Suite;
  }
}

async function verifyRevocationCredential (revocationCredential: VerifiableCredential): Promise<void> {
  const issuerProfile = await domain.verifier.getIssuerProfile(revocationCredential.issuer);
  let { proof } = revocationCredential;

  if (!Array.isArray(proof)) {
    proof = [proof];
  }

  let verificationFailures = [];

  for (const p of proof) {
    const suiteInstantiationOptions: SuiteAPI = {
      issuer: issuerProfile,
      document: revocationCredential as any,
      proof: p,
      executeStep: async (step, action): Promise<any> => {
        try {
          const res: any = await action();
          return res;
        } catch (e) {
          console.log('step', step, 'failed with error:');
          console.error(e);
          verificationFailures.push(step);
        }
      }
    };
    const VerificationSuite = await getVerificationSuiteForProof(p.type);
    // @ts-expect-error not sure why typescript is complaining
    const suite = new VerificationSuite(suiteInstantiationOptions);
    await suite.verifyProof();

    const hasError = verificationFailures.length > 0;
    verificationFailures = [];
    if (hasError) {
      throw new VerifierError(SUB_STEPS.checkRevokedStatus, 'The authenticity of the revocation list could not be verified.');
    }
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
