import { MerkleProof2019 } from '../models/MerkleProof2019';
import { IDidDocument } from '../models/DidDocument';
import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { ISecp256k1PublicKeyJwk, publicKeyUInt8ArrayFromJwk } from '../helpers/keyUtils';
import { IBlockchainObject, SupportedChains } from '../constants/blockchains';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../helpers/issuingAddress';

const baseError = 'Issuer identity mismatch';

function getDocumentId (didDocument: IDidDocument): string {
  return didDocument.id;
}

function checkVerificationMethod (didDocument: IDidDocument, verificationMethod: string): boolean {
  const documentId = getDocumentId(didDocument);
  const verificationDid = verificationMethod.split('#')[0];
  return documentId === verificationDid;
}

function findVerificationMethodPublicKey (didDocument: IDidDocument, verificationMethod: string): IDidDocumentPublicKey {
  const verificationMethodId = verificationMethod.split('#')[1];
  const verificationMethodFromDocument = didDocument.verificationMethod;
  return verificationMethodFromDocument
    .filter(verificationMethod => verificationMethod.id === `#${verificationMethodId}`)[0];
}

function retrieveIssuingAddress (verificationMethodPublicKey: IDidDocumentPublicKey, chain: IBlockchainObject): string {
  const publicKey = publicKeyUInt8ArrayFromJwk(verificationMethodPublicKey.publicKeyJwk as ISecp256k1PublicKeyJwk);
  let address: string = '';
  switch (chain.code) {
    case SupportedChains.Bitcoin:
    case SupportedChains.Mocknet:
    case SupportedChains.Testnet:
      address = computeBitcoinAddressFromPublicKey(publicKey, chain);
      break;

    case SupportedChains.Ethmain:
    case SupportedChains.Ethropst:
    case SupportedChains.Ethrinkeby:
      address = computeEthereumAddressFromPublicKey(publicKey, chain);
      break;

    default:
      throw new Error('Unsupported chain for DID verification');
  }
  return address;
}

export interface IConfirmDidSignatureApi {
  didDocument: IDidDocument;
  proof: MerkleProof2019;
  issuingAddress: string;
  chain: IBlockchainObject;
}

export default function confirmDidSignature ({
  didDocument,
  proof,
  issuingAddress,
  chain
}: IConfirmDidSignatureApi): boolean {
  try {
    const { verificationMethod } = proof;

    if (!checkVerificationMethod(didDocument, verificationMethod)) {
      throw new Error(`${baseError} - the identity document provided by the issuer does not match the verification method`);
    }

    const verificationMethodPublicKey = findVerificationMethodPublicKey(didDocument, verificationMethod);
    if (!verificationMethodPublicKey) {
      throw new Error(`${baseError} - the identity document provided by the issuer does not reference the verification method`);
    }

    if (issuingAddress !== retrieveIssuingAddress(verificationMethodPublicKey, chain)) {
      throw new Error(`${baseError} - the provided verification method does not match the issuer identity`);
    }

    return true;
  } catch (e) {
    console.error(e);
    throw new Error(`${baseError} - ${e.message as string}`);
  }
}
