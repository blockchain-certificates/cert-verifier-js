import parseV1 from './parseV1';
import parseV2 from './parseV2';
import parseV3 from './parseV3';
import { IBlockchainObject } from '../constants/blockchains';
import { Issuer } from '../models/Issuer';
import Versions from '../constants/certificateVersions';
import { MerkleProof2019 } from '../models/MerkleProof2019';
import { Blockcerts } from '../models/Blockcerts';
import { retrieveBlockcertsVersion } from './retrieveBlockcertsVersion';
import { Receipt } from '../models/Receipt';
import { SignatureImage } from '../models';

export const versionParserMap = {
  1: parseV1,
  2: parseV2,
  3: parseV3
};

export interface ParsedCertificate {
  certificateImage?: string;
  chain: IBlockchainObject;
  description?: string;
  expires?: string;
  id: string;
  isFormatValid?: boolean;
  error?: string;
  issuedOn?: string;
  issuer: Issuer;
  metadataJson?: string;
  name?: string;
  publicKey?: string;
  receipt: Receipt;
  recipientFullName?: string;
  recordLink?: string;
  revocationKey?: string;
  sealImage?: string;
  signature?: string;
  signatureImage?: SignatureImage[];
  subtitle?: string;
  version: Versions;
  proof?: MerkleProof2019;
}

export {
  retrieveBlockcertsVersion
};

export default async function parseJSON (certificateJson: Blockcerts): Promise<ParsedCertificate> {
  try {
    const version: number = retrieveBlockcertsVersion(certificateJson['@context']);
    const parsedCertificate = await versionParserMap[version](certificateJson);
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
