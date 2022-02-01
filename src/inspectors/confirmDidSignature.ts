import { MerkleProof2019 } from '../models/MerkleProof2019';
import { IDidDocument } from '../models/DidDocument';
import { IBlockchainObject } from '../constants/blockchains';
import domain from '../domain';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../constants';
import controlVerificationMethod from './did/controlVerificationMethod';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey';
import deriveIssuingAddressFromPublicKey from './did/deriveIssuingAddressFromPublicKey';

const baseError = domain.i18n.getText('errors', 'identityErrorBaseMessage');

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

    if (issuingAddress !== deriveIssuingAddressFromPublicKey(verificationMethodPublicKey, chain)) {
      throw new VerifierError(SUB_STEPS.deriveIssuingAddressFromPublicKey, `${baseError} - ${domain.i18n.getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
    }

    return true;
  } catch (e) {
    console.error(e);
    throw new Error(`${e.message as string}`);
  }
}
