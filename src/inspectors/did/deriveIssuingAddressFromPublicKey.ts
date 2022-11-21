import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';
import { SupportedChains } from '../../constants/blockchains'; // TODO: this should be exposed by @blockcerts/explorer-lookup
import type { ISecp256k1PublicKeyJwk } from '../../helpers/keyUtils';
import { publicKeyUInt8ArrayFromJwk } from '../../helpers/keyUtils';
import { computeBitcoinAddressFromPublicKey, computeEthereumAddressFromPublicKey } from '../../helpers/issuingAddress';
import domain from '../../domain';
import { baseError } from './index';
import { VerifierError } from '../../models';

// TODO: should this still be part of this package? Duplicate in jsonld-signatures-merkleproof2019
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
    case SupportedChains.Ethgoerli:
    case SupportedChains.Ethsepolia:
      address = computeEthereumAddressFromPublicKey(publicKey, chain);
      break;

    default:
      throw new VerifierError('deriveIssuingAddressFromPublicKey', `${baseError} - ${domain.i18n.getText('errors', 'deriveIssuingAddressFromPublicKey')}`);
  }
  return address;
}
