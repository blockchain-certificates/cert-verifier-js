import parseV1 from './parseV1.js';
import parseV2 from './parseV2.js';
import parseV3 from './parseV3.js';
import { retrieveBlockcertsVersion } from './helpers/retrieveBlockcertsVersion.js';
import type { Issuer } from '../models/Issuer.js';
import type { Blockcerts } from '../models/Blockcerts.js';
import type SignatureImage from '../models/SignatureImage.js';
import type { BlockcertsVersion } from './helpers/retrieveBlockcertsVersion.js';
import type { BlockcertsV3Display } from '../models/BlockcertsV3.js';

export const versionParserMap = {
  1: parseV1,
  2: parseV2,
  3: parseV3
};

export interface ParsedCertificate {
  certificateImage?: string;
  description?: string;
  display?: BlockcertsV3Display;
  expires?: string;
  id: string;
  isFormatValid?: boolean;
  error?: string;
  issuedOn?: string;
  issuer: Issuer;
  metadataJson?: string;
  name?: string;
  recipientFullName?: string;
  recordLink?: string;
  revocationKey?: string;
  sealImage?: string;
  signature?: string;
  signatureImage?: SignatureImage[];
  subtitle?: string;
}

export {
  retrieveBlockcertsVersion
};

export default async function parseJSON (certificateJson: Blockcerts): Promise<ParsedCertificate> {
  try {
    const blockcertsVersion: BlockcertsVersion = retrieveBlockcertsVersion(certificateJson['@context']);
    const parsedCertificate = await versionParserMap[blockcertsVersion.versionNumber](certificateJson);
    parsedCertificate.isFormatValid = true;
    return parsedCertificate;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      isFormatValid: false,
      error: error.message
    } as ParsedCertificate;
  }
}
