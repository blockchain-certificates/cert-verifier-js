import { MerkleProof2019 } from '../models/MerkleProof2019';
import { IDidDocument } from '../models/DidDocument';
import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { ISecp256k1PublicKeyJwk, publicKeyUInt8ArrayFromJwk } from '../helpers/keyUtils';
import { IBlockchainObject, SupportedChains } from '../constants/blockchains';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../helpers/issuingAddress';
import domain from '../domain';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants';

const baseError = domain.i18n.getText('errors', 'identityErrorBaseMessage');

function getDocumentId (didDocument: IDidDocument): string {
  return didDocument.id;
}

function checkVerificationMethod (didDocument: IDidDocument, verificationMethod: string): void {
  const documentId = getDocumentId(didDocument);
  const verificationDid = verificationMethod.split('#')[0];
  if (documentId !== verificationDid) {
    throw new VerifierError(SUB_STEPS.controlVerificationMethod, `${baseError} - ${domain.i18n.getText('errors', 'controlVerificationMethod')}`);
  }
}

function findVerificationMethodPublicKey (didDocument: IDidDocument, verificationMethod: string): IDidDocumentPublicKey {
  const verificationMethodId = verificationMethod.split('#')[1];
  const verificationMethodFromDocument = didDocument.verificationMethod;
  const verificationMethodPublicKey = verificationMethodFromDocument
    .filter(verificationMethod => verificationMethod.id === `#${verificationMethodId}`)[0];
  if (!verificationMethodPublicKey) {
    throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, `${baseError} - ${domain.i18n.getText('errors', 'retrieveVerificationMethodPublicKey')}`);
  }
  return verificationMethodPublicKey;
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
      throw new Error(`${baseError} - ${domain.i18n.getText('errors', 'identityErrorUnsupportedBlockchain')}`);
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
    checkVerificationMethod(didDocument, verificationMethod);
    const verificationMethodPublicKey = findVerificationMethodPublicKey(didDocument, verificationMethod);

    if (issuingAddress !== retrieveIssuingAddress(verificationMethodPublicKey, chain)) {
      throw new VerifierError(SUB_STEPS.deriveIssuingAddressFromPublicKey, `${baseError} - ${domain.i18n.getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
    }

    return true;
  } catch (e) {
    console.error(e);
    throw new Error(`${e.message as string}`);
  }
}
