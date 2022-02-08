import { Blockcerts, UnsignedBlockcerts } from '../../models/Blockcerts';
import { BlockcertsV3 } from '../../models/BlockcertsV3';
import { BlockcertsV2 } from '../../models/BlockcertsV2';
import { isV3 } from '../../constants/certificateVersions';
import { retrieveBlockcertsVersion } from './retrieveBlockcertsVersion';

export default function retrieveUnsignedBlockcerts (certificateJson: Blockcerts): UnsignedBlockcerts {
  const certificateCopy = Object.assign({}, certificateJson);
  const { version } = retrieveBlockcertsVersion(certificateJson['@context']);
  if (isV3(version)) {
    delete (certificateCopy as BlockcertsV3).proof;
  } else {
    delete (certificateCopy as BlockcertsV2).signature;
  }
  return certificateCopy;
}
