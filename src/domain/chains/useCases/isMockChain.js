import { BLOCKCHAINS } from '../../../constants';

export default function isMockChain (chain) {
  if (chain) {
    const chainCode = typeof chain === 'string' ? chain : chain.code;
    const isChainValid = Object.keys(BLOCKCHAINS).find(chainObj => chainObj === chainCode);

    if (!isChainValid) {
      return null;
    }

    return chainCode === BLOCKCHAINS.mocknet.code || chainCode === BLOCKCHAINS.regtest.code;
  }

  return null;
}
