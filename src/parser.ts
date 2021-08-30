import { versionParserMap } from './parsers';
import { MerkleProof2019 } from './models/MerkleProof2019';
import { Receipt } from './models/Receipt';
import { IBlockchainObject } from './constants/blockchains';
import { Issuer } from './models/Issuer';
import Versions from './constants/certificateVersions';
import { Blockcerts } from './models/Blockcerts';

function lookupVersion (array: string[], v: string): boolean {
  return array.some(str => str.includes(`v${v}`) || str.includes(`${v}.`));
}

function retrieveBlockcertsVersion (context): number {
  if (typeof context === 'string') {
    context = [context];
  }

  const blockcertsContext = context.filter(ctx => typeof ctx === 'string').find(ctx => ctx.toLowerCase().indexOf('blockcerts') > 0);
  const blockcertsContextArray: string[] = blockcertsContext.split('/').filter(str => str !== '');

  const availableVersions: string[] = Object.keys(versionParserMap);

  return parseInt(availableVersions.filter(version => lookupVersion(blockcertsContextArray, version.toString()))[0], 10);
}

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
  signatureImage?: string;
  subtitle?: string;
  version: Versions;
  proof?: MerkleProof2019;
}

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
