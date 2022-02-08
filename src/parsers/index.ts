import parseV1 from './parseV1';
import parseV2 from './parseV2';
import parseV3 from './parseV3';
import { IBlockchainObject } from '../constants/blockchains';
import Versions from '../constants/certificateVersions';
import { Issuer } from '../models/Issuer';
import { MerkleProof2019 } from '../models/MerkleProof2019';
import { Blockcerts } from '../models/Blockcerts';
import { Receipt } from '../models/Receipt';
import { SignatureImage } from '../models';
import { BlockcertsVersion, retrieveBlockcertsVersion } from './helpers/retrieveBlockcertsVersion';

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
    const blockcertsVersion: BlockcertsVersion = retrieveBlockcertsVersion(certificateJson['@context']);
    const parsedCertificate = await versionParserMap[blockcertsVersion.versionNumber](certificateJson, blockcertsVersion.version);
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
