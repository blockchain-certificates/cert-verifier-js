import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { IBlockchainObject, SupportedChains } from '../../constants/blockchains';
import { ISecp256k1PublicKeyJwk, publicKeyUInt8ArrayFromJwk } from '../../helpers/keyUtils';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../../helpers/issuingAddress';
import domain from '../../domain';
import { baseError } from './index';

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
      throw new Error(`${baseError} - ${domain.i18n.getText('errors', 'identityErrorUnsupportedBlockchain')}`);
  }
  return address;
}
