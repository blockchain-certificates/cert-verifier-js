import type { Blockcerts, UnsignedBlockcerts } from '../../models/Blockcerts.js';
import type { BlockcertsV3 } from '../../models/BlockcertsV3.js';
import { deepCopy } from '../../helpers/object.js';

function deleteMerkleProof2019From (certificate: BlockcertsV3): Blockcerts {
  const copy = deepCopy<BlockcertsV3>(certificate);
  if (!Array.isArray(certificate.proof)) {
    delete copy.proof;
    return copy;
  }

  // TODO: this assumes that the merkle proof is always ChainedProof2021, which it shouldn't
  const initialSignature = certificate.proof.find(p => p.type !== 'ChainedProof2021');
  copy.proof = initialSignature;
  return copy;
}

export default function retrieveUnsignedBlockcerts (certificateJson: Blockcerts): UnsignedBlockcerts {
  const certificateCopy: Blockcerts = deepCopy<Blockcerts>(certificateJson);
  if ('proof' in certificateCopy) {
    return deleteMerkleProof2019From(certificateCopy);
  } else if ('signature' in certificateCopy) {
    delete certificateCopy.signature;
  }
  return certificateCopy;
}
