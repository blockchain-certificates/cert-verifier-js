import type { IDidDocument } from '../../../../models/DidDocument';
import type { ResolutionOptions } from '@transmute/did-key-common/dist/types/ResolutionOptions';
import type { ResolutionResponse } from '@transmute/did-key-common/src/types/ResolutionResponse';

interface TransmuteDidKeyResolver {
  generate: (keyGenOptions: any, resolutionOptions: ResolutionOptions) => any;
  resolve: (didKeyUri: string, options?: ResolutionOptions) => Promise<ResolutionResponse>;
}

enum SupportedSuite {
  ED25519 = 'ed25519',
  SECP256K1 = 'secp256k1'
}

const supportedSuiteMap: Record<string, SupportedSuite> = {
  'did:key:z6Mk': SupportedSuite.ED25519,
  'did:key:zQ3s': SupportedSuite.SECP256K1
};

async function getResolver (suite: SupportedSuite): Promise<TransmuteDidKeyResolver> {
  if (suite === SupportedSuite.ED25519) {
    const didKeyResolver = await import('@transmute/did-key-ed25519');
    return didKeyResolver;
  }

  if (suite === SupportedSuite.SECP256K1) {
    const didKeyResolver = await import('@transmute/did-key-secp256k1');
    return didKeyResolver;
  }

  throw new Error('Error loading did key resolver');
}

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const keyPrefix = didKeyUri.substring(0, 12);
  if (supportedSuiteMap[keyPrefix]) {
    const resolver = await getResolver(supportedSuiteMap[keyPrefix]);

    const { didDocument } = await resolver.resolve(didKeyUri, { accept: 'application/did+json' });
    return didDocument as unknown as IDidDocument; // transmute libs has a lighter definition of DidDocument
  }

  throw new Error('Unsupported did:key suite');
}
