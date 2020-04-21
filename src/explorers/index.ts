import { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo } from './explorer';

const defaultExplorers = [
  ...BitcoinExplorers,
  ...EthereumExplorers,
  ...BlockchainExplorersWithSpentOutputInfo
];

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo, defaultExplorers };

