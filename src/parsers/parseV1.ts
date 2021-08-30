import VerifierError from '../models/verifierError';
/**
 * deprecated
 * parseV1
 *
 * @param certificateJson
 * @returns {Certificate}
 */
export default function parseV1 (): void {
  throw new VerifierError(
    '',
    'Verification of v1 certificates is not supported by this component. ' +
    'See the python cert-verifier for v1.1 verification ' +
    'or the npm package cert-verifier-js-v1-legacy for v1.2 ' +
    '(https://www.npmjs.com/package/@blockcerts/cert-verifier-js-v1-legacy)'
  );
}
