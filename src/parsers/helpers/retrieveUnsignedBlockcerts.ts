import type { Blockcerts, UnsignedBlockcerts } from '../../models/Blockcerts';
import type { BlockcertsV3 } from '../../models/BlockcertsV3';
import type { BlockcertsV2 } from '../../models/BlockcertsV2';
import { isV3 } from '../../constants/certificateVersions';
import { retrieveBlockcertsVersion } from './retrieveBlockcertsVersion';
import { deepCopy } from '../../helpers/object';

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
  const { version } = retrieveBlockcertsVersion(certificateJson['@context']);
  if (isV3(version)) {
    return deleteMerkleProof2019From(certificateCopy as BlockcertsV3);
  } else {
    delete (certificateCopy as BlockcertsV2).signature;
  }
  return certificateCopy;
}
