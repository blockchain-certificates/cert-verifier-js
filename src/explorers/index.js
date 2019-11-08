import { getEtherScanFetcher } from './ethereum';
import { getBlockcypherFetcher } from './bitcoin';

const BitcoinExplorers = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];

const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
