import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { IBlockchainObject } from '../../constants/blockchains';
import { SupportedChains } from '../../constants/blockchains';
import type { ISecp256k1PublicKeyJwk } from '../../helpers/keyUtils';
import { publicKeyUInt8ArrayFromJwk } from '../../helpers/keyUtils';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../../helpers/issuingAddress';
import domain from '../../domain';
import { baseError } from './index';
import { VerifierError } from '../../models';
import { SUB_STEPS } from '../../constants';

export default function deriveIssuingAddressFromPublicKey (verificationMethodPublicKey: IDidDocumentPublicKey, chain: IBlockchainObject): string {
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
      throw new VerifierError(SUB_STEPS.deriveIssuingAddressFromPublicKey, `${baseError} - ${domain.i18n.getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
  }
  return address;
}
