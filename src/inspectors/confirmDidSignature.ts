import type { MerkleProof2019 } from '../models/MerkleProof2019';
import type { IDidDocument } from '../models/DidDocument';
import type { IBlockchainObject } from '../constants/blockchains';
import controlVerificationMethod from './did/controlVerificationMethod';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey';
import deriveIssuingAddressFromPublicKey from './did/deriveIssuingAddressFromPublicKey';
import compareIssuingAddress from './did/compareIssuingAddress';

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
