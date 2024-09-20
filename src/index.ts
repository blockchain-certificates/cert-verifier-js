import Certificate from './certificate';
import VerificationSubstep from './domain/verifier/valueObjects/VerificationSubstep';

async function loadNodePolyfills (): Promise<void> {
  if (!globalThis.crypto.createHash) {
    console.log('Loading create-hash polyfill');
    const createHash = await import('create-hash');
    globalThis.crypto.createHash = createHash.default;
  }

  if (!globalThis.Buffer) {
    console.log('Loading buffer polyfill');
    const buffer = await import('buffer');
    globalThis.Buffer = buffer.Buffer;
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
loadNodePolyfills();

export { Certificate, VerificationSubstep };
export { VERIFICATION_STATUSES } from './constants/verificationStatuses';
export * as STEPS from './domain/verifier/entities/verificationSteps';
export { getSupportedLanguages } from './domain/i18n/useCases';
export { BLOCKCHAINS, CERTIFICATE_VERSIONS } from './constants';
export { SignatureImage } from './models';
export { retrieveBlockcertsVersion } from './parsers';
