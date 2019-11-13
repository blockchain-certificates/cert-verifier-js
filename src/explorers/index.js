import { getEtherScanFetcher } from './ethereum';
import { getBlockcypherTransaction } from './bitcoin';

const BitcoinExplorers = [
  (transactionId, chain) => getBlockcypherTransaction(transactionId, chain)
];

const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockcypherTransaction(transactionId, chain)
];

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
