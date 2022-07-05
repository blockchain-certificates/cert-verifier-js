import { SupportedChains } from '../../constants/blockchains.js';
import { publicKeyUInt8ArrayFromJwk } from '../../helpers/keyUtils.js';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../../helpers/issuingAddress.js';
import domain from '../../domain/index.js';
import { baseError } from './index.js';
import VerifierError from '../../models/VerifierError.js';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { IBlockchainObject } from '../../constants/blockchains.js';
import type { ISecp256k1PublicKeyJwk } from '../../helpers/keyUtils.js';

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
      throw new VerifierError('deriveIssuingAddressFromPublicKey', `${baseError} - ${domain.i18n.getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
  }
  return address;
}
