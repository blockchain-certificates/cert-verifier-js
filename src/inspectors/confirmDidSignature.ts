import controlVerificationMethod from './did/controlVerificationMethod.js';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey.js';
import deriveIssuingAddressFromPublicKey from './did/deriveIssuingAddressFromPublicKey.js';
import compareIssuingAddress from './did/compareIssuingAddress.js';
import type { MerkleProof2019 } from '../models/MerkleProof2019.js';
import type { IDidDocument } from '../models/DidDocument.js';
import type { IBlockchainObject } from '../constants/blockchains.js';

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
    controlVerificationMethod(didDocument, verificationMethod);
    const verificationMethodPublicKey = retrieveVerificationMethodPublicKey(didDocument, verificationMethod);
    const derivedIssuingAddress = deriveIssuingAddressFromPublicKey(verificationMethodPublicKey, chain);
    compareIssuingAddress(issuingAddress, derivedIssuingAddress);

    return true;
  } catch (e) {
    console.error(e);
    throw new Error(`${e.message as string}`);
  }
}
