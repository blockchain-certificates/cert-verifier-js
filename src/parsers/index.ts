import parseV1 from './parseV1';
import type { Issuer } from '../models/Issuer';
import type { Blockcerts } from '../models/Blockcerts';
import type { SignatureImage } from '../models';
import type { BlockcertsVersion } from './helpers/retrieveBlockcertsVersion';
import { retrieveBlockcertsVersion } from './helpers/retrieveBlockcertsVersion';

function notSupported (): void {
  throw new Error('The verification of a Blockcerts v2 or v3 is not supported by this library which is only a legacy support for Blockcerts v1. ' +
    'Please use @blockcerts/cert-verifier-js for modern versions.');
}

export const versionParserMap = {
  1: parseV1,
  2: notSupported,
  3: notSupported
};

export interface ParsedCertificate {
  certificateImage?: string;
  description?: string;
  display?: string;
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
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      isFormatValid: false,
      error: error.message
    } as ParsedCertificate;
  }
}
