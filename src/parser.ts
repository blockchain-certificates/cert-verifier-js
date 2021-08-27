import { versionParserMap } from './parsers';

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

export default async function parseJSON (certificateJson): Promise<ParsedCertificate> {
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
