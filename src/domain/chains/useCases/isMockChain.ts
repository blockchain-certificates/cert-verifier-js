import { BLOCKCHAINS } from '../../../constants';
import type { IBlockchainObject } from '../../../constants/blockchains';

export default function isMockChain (chain: IBlockchainObject): boolean {
  if (chain) {
    const chainCode = typeof chain === 'string' ? chain : chain.code; // TODO: can it be string?
    const isChainValid = Object.keys(BLOCKCHAINS).some(chainObj => chainObj === chainCode);

    if (!isChainValid) {
      return false;
    }

    return !!BLOCKCHAINS[chainCode].test;
  }

  return false;
}
