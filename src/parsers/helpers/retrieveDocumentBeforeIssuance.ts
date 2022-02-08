import { Blockcerts, UnsignedBlockcerts } from '../../models/Blockcerts';
import { BlockcertsV3 } from '../../models/BlockcertsV3';
import { BlockcertsV2 } from '../../models/BlockcertsV2';
import Versions, { isV3 } from '../../constants/certificateVersions';

export default function retrieveDocumentBeforeIssuance (certificateJson: Blockcerts, version: Versions): UnsignedBlockcerts {
  const certificateCopy = Object.assign({}, certificateJson);
  if (isV3(version)) {
    delete (certificateCopy as BlockcertsV3).proof;
  } else {
    delete (certificateCopy as BlockcertsV2).signature;
  }
  return certificateCopy;
}
