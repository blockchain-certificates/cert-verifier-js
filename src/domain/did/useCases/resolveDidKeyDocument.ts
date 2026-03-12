import type { IDidDocument } from '../../../models/DidDocument';
import { keyUtils } from '@blockcerts/ecdsa-secp256k1-verification-key-2019';
import { publicKeyMultibaseToBytes } from '../../../helpers/keyUtils';

enum SupportedSuite {
  ED25519 = 'ed25519',
  SECP256K1 = 'secp256k1'
}

function generateDidDoc ({
  keyId,
  did,
  keyType,
  jwk
}) {
  return {
    '@context': ['https://www.w3.org/ns/did/v1'],
    verificationMethod: [{
      id: keyId,
      type: keyType,
      controller: did,
      publicKeyJwk: jwk
    }],
    id: did,
    authentication: [keyId],
    assertionMethod: [keyId],
    capabilityDelegation: [keyId],
    capabilityInvocation: [keyId],
    keyAgreement: [keyId as any],
  } as any
}

async function generateDidDocumentFromDidSecp256k1 (did: string): Promise<IDidDocument> {
  const publicKeyMultibase = did.substring(8);
  const publicKeyBytes = publicKeyMultibaseToBytes(publicKeyMultibase);
  const jwk = keyUtils.publicKeyJWKFrom.publicKeyUint8Array(publicKeyBytes, '');
  const keyId = did + '#' + publicKeyMultibase;
  return generateDidDoc({ keyId, did, jwk, keyType: 'EcdsaVerificationKey2019'})
}

async function generateDidDocumentFromDidEd25519 (did: string): Promise<IDidDocument> {
  const multiKey = await import('@digitalbazaar/ed25519-multikey');
  const publicKeyMultibase = did.substring(8);
  const publicKeyBytes = publicKeyMultibaseToBytes(publicKeyMultibase);
  const jwk = await multiKey.toJwk({ keyPair: { publicKey: publicKeyBytes }});
  const keyId = did + '#' + publicKeyMultibase;
  return generateDidDoc({ keyId, did, jwk, keyType: 'JsonWebKey2020' });
}

const supportedSuiteMap: Record<string, SupportedSuite> = {
  'did:key:z6Mk': SupportedSuite.ED25519,
  'did:key:zQ3s': SupportedSuite.SECP256K1
};

async function getResolver (suite: SupportedSuite): Promise<{ resolve(did: string): Promise<{ didDocument: IDidDocument }> }> {
  if (suite === SupportedSuite.ED25519) {
    return {
      resolve: async (did:string): Promise<{ didDocument: IDidDocument }> => ({
        didDocument: await generateDidDocumentFromDidEd25519(did) as any
      })
    }
  }

  if (suite === SupportedSuite.SECP256K1) {
    return {
      resolve: async (did: string): Promise<{ didDocument: IDidDocument }> => ({
        didDocument: await generateDidDocumentFromDidSecp256k1(did) as any
      })
    };
  }

  throw new Error('Error loading did key resolver');
}

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const keyPrefix = didKeyUri.substring(0, 12);
  if (supportedSuiteMap[keyPrefix]) {
    const resolver = await getResolver(supportedSuiteMap[keyPrefix]);

    const { didDocument } = await resolver.resolve(didKeyUri);
    return didDocument;
  }

  throw new Error('Unsupported did:key suite');
}
