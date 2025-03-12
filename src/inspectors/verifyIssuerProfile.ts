import { cryptoSuiteToType } from '../helpers/cryptoSuite';
import { SupportedVerificationSuites } from '../verifier';
import { type Suite } from '../models/Suite';
import { type Issuer } from '../models/Issuer';

async function loadRequiredVerificationSuite (proofType: string): Promise<Suite> {
  if (proofType === SupportedVerificationSuites.MerkleProof2019) {
    const { default: MerkleProof2019VerificationSuite } = await import('../suites/MerkleProof2019');
    return MerkleProof2019VerificationSuite as unknown as Suite;
  }

  if (proofType === SupportedVerificationSuites.Ed25519Signature2020) {
    const { default: Ed25519Signature2020VerificationSuite } = await import('../suites/Ed25519Signature2020');
    return Ed25519Signature2020VerificationSuite as unknown as Suite;
  }

  if (proofType === SupportedVerificationSuites.EcdsaSecp256k1Signature2019) {
    const { default: EcdsaSecp256k1Signature2019VerificationSuite } = await import('../suites/EcdsaSecp256k1Signature2019');
    return EcdsaSecp256k1Signature2019VerificationSuite as unknown as Suite;
  }

  if (proofType === SupportedVerificationSuites.EcdsaSd2023) {
    const { default: EcdsaSd2023VerificationSuite } = await import('../suites/EcdsaSd2023');
    return EcdsaSd2023VerificationSuite as unknown as Suite;
  }
}

export default async function verifyIssuerProfile (issuerProfile: Issuer): Promise<any> {
  if (!issuerProfile.proof) {
    console.warn('No proof found in the issuer profile.');
    return;
  }

  let proofType = issuerProfile.proof.type;
  if (proofType === 'DataIntegrityProof') {
    proofType = cryptoSuiteToType(issuerProfile.proof.cryptosuite);
  }

  const VerificationSuite: any = await loadRequiredVerificationSuite(proofType);

  const suite: Suite = new VerificationSuite({
    document: issuerProfile,
    proof: issuerProfile.proof,
    issuer: issuerProfile.issuer ? issuerProfile.issuer : issuerProfile,
    executeStep: async (step: string, action: () => any, verificationSuite?: string) => {
      return action();
    }
  });

  await suite.init();
  try {
    await suite.verifyProof();
  } catch (e) {
    throw new Error(`Issuer profile verification failed: ${e.message}`); // TODO: i18n
  }
}
