import { versionParserMap } from './parsers';
import { createWriteStream } from 'fs';

export interface ParsedCertificateValidityFormat {
  isFormatValid: boolean;
  error: string;
}

export interface ParsedCertificate extends ParsedCertificateValidityFormat {
  certificateImage;
  chain;
  description;
  expires;
  id;
  isFormatValid;
  issuedOn;
  issuer;
  metadataJson;
  name;
  publicKey;
  receipt;
  recipientFullName;
  recordLink;
  revocationKey;
  sealImage;
  signature;
  signatureImage;
  subtitle;
  version;
}

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

export default async function parseJSON (certificateJson): Promise<ParsedCertificate> {
  try {
    const version: number = retrieveBlockcertsVersion(certificateJson['@context']);

    if (version !== 1) {
      const versionErrorMessage: string = 'The document you are trying to parse is not Blockcerts V1. Please refer to cert-verifier-js to parse' +
        ' and verify newer versions: https://github.com/blockchain-certificates/cert-verifier-js';
      console.warn(versionErrorMessage);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        isFormatValid: false,
        error: versionErrorMessage
      } as ParsedCertificate;
    }

    const parsedCertificate = await versionParserMap[version](certificateJson);
    parsedCertificate.isFormatValid = true;
    return parsedCertificate;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      isFormatValid: false,
      error
    } as ParsedCertificate;
  }
}
