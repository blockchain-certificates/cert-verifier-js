import type { IBlockchainObject } from '../../../constants/blockchains';
import { BLOCKCHAINS } from '../../../constants/blockchains';
import addresses from '../../addresses';
import { getText } from '../../i18n/useCases';
import { capitalize } from '../../../helpers/string';
import type { Receipt } from '../../../models/Receipt';
import type { MerkleProof2017Anchor } from '../../../models/MerkleProof2017';

// merkleRoot2019: see https://w3c-dvcg.github.io/lds-merkle-proof-2019/#blockchain-keymap
function getMerkleRoot2019Chain (anchor): IBlockchainObject {
  const supportedChainsMap = {
    btc: {
      chainName: BLOCKCHAINS.bitcoin.name
    },
    eth: {
      chainName: BLOCKCHAINS.ethmain.name
    }
  };
  const dataArray = anchor.split(':');
  const chainIndex: number = dataArray.findIndex(data => Object.keys(supportedChainsMap).includes(data));
  if (chainIndex > -1) {
    const chainCode = dataArray[chainIndex];
    const network = dataArray[chainIndex + 1];
    const chainCodeSignatureValue = supportedChainsMap[chainCode].chainName.toLowerCase() + capitalize(network);
    return getChainObject(chainCodeSignatureValue);
  } else {
    return defaultChainAssumption();
  }
}

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
    } else if (typeof anchor === 'string') {
      return getMerkleRoot2019Chain(anchor);
    }
  }

  // Legacy path: we didn't support anything other than testnet and mainnet, so we check the address prefix
  // otherwise try to determine the chain from a bitcoin address
  return defaultChainAssumption(address);
}
