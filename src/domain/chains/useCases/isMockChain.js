import { BLOCKCHAINS } from '../../../constants';

export default function isMockChain (chain) {
  if (chain) {
    const chainCode = typeof chain === 'string' ? chain : chain.code;
    const isChainValid = Object.keys(BLOCKCHAINS).some(chainObj => chainObj === chainCode);

    if (!isChainValid) {
      return null;
    }

    return !!BLOCKCHAINS[chainCode].test;
  }

  return null;
}
