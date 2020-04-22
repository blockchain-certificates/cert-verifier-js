import {
  BitcoinExplorers,
  BlockchainExplorersWithSpentOutputInfo,
  EthereumExplorers,
  TExplorerFunctionsArray
} from './explorer';

export type TDefaultExplorersPerBlockchain = {
  bitcoin: TExplorerFunctionsArray,
  ethereum: TExplorerFunctionsArray,
  v1: TExplorerFunctionsArray
};

export function getDefaultExplorers (): TDefaultExplorersPerBlockchain {
  return {
    bitcoin: BitcoinExplorers,
    ethereum: EthereumExplorers,
    v1: BlockchainExplorersWithSpentOutputInfo
  };
}

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };

