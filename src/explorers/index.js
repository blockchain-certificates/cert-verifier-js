import { getEtherScanFetcher } from '../ethereum';
import { getBlockchainTransactionFromApi } from '../blockchain-explorer';
import { TRANSACTION_APIS } from '../../constants';

const BitcoinExplorers = [
  (transactionId, chain) => getBlockchainTransactionFromApi(TRANSACTION_APIS.Blockcypher, transactionId, chain),
  (transactionId, chain) => getBlockchainTransactionFromApi(TRANSACTION_APIS.Bitpay, transactionId, chain),
  (transactionId, chain) => getBlockchainTransactionFromApi(TRANSACTION_APIS.Blockexplorer, transactionId, chain),
  (transactionId, chain) => getBlockchainTransactionFromApi(TRANSACTION_APIS.Blockstream, transactionId, chain)
];

const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockchainTransactionFromApi(TRANSACTION_APIS.Blockcypher, transactionId, chain)
];

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
