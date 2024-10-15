import type { BlockcertsV3 } from '../../../models/BlockcertsV3';

export interface DatesToValidate {
  property: string;
  dateTimeStamp: string;
}

export default function getDatesToValidate (credential: BlockcertsV3): DatesToValidate[] {
  const dates: DatesToValidate[] = [];
  if (credential.validFrom) {
    dates.push({
      property: 'validFrom',
      dateTimeStamp: credential.validFrom
    });
  }

  if (credential.validUntil) {
    dates.push({
      property: 'validUntil',
      dateTimeStamp: credential.validUntil
    });
  }

  const proof = !Array.isArray(credential.proof) ? [credential.proof] : credential.proof;
  for (const proofItem of proof) {
    if (proofItem.created) {
      dates.push({
        property: `proof ${proofItem.cryptosuite ?? proofItem.type} created`,
        dateTimeStamp: proofItem.created
      });
    }
  }

  return dates;
}
