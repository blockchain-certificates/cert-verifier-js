import VerifierError from '../models/VerifierError.js';
import domain from '../domain/index.js';

export default function ensureMerkleRootEqual (merkleRoot: string, remoteHash: string): boolean {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError(
      'checkMerkleRoot',
      domain.i18n.getText('errors', 'ensureMerkleRootEqual')
    );
  }

  return true;
}
