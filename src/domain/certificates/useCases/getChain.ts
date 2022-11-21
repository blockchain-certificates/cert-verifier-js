import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import addresses from '../../addresses';
import { getText } from '../../i18n/useCases';
import type { IBlockchainObject } from '@blockcerts/explorer-lookup';
import type { Receipt } from '../../../models/Receipt';
import type { MerkleProof2017Anchor } from '../../../models/MerkleProof2017';

function defaultChainAssumption (address = ''): IBlockchainObject {
  return addresses.isMainnet(address) ? BLOCKCHAINS.bitcoin : BLOCKCHAINS.testnet;
}

function getChainObject (chainCodeSignatureValue): IBlockchainObject {
  const chainObject: IBlockchainObject = Object.keys(BLOCKCHAINS)
    .map(key => BLOCKCHAINS[key])
    .find((entry: IBlockchainObject) => entry.signatureValue === chainCodeSignatureValue);
  if (typeof chainObject === 'undefined') {
    throw new Error(getText('errors', 'getChain'));
  }
  return chainObject;
}

/**
 * getChain
 *
 * Returns a chain object by looking at the signature value or the bitcoin address (legacy)
 *
 * @param signature
 * @param address
 * @returns {*}
 */
export default function getChain (address: string, proof: Receipt): IBlockchainObject {
  const cleanedSignature = proof || null;
  if (cleanedSignature?.anchors) {
    const anchors = cleanedSignature.anchors;
    const anchor = anchors[0];
    if ((anchor as MerkleProof2017Anchor).chain) {
      const chainCodeSignatureValue = (anchor as MerkleProof2017Anchor).chain;
      return getChainObject(chainCodeSignatureValue);
    }
  }

  // Legacy path: we didn't support anything other than testnet and mainnet, so we check the address prefix
  // otherwise try to determine the chain from a bitcoin address
  return defaultChainAssumption(address);
}
