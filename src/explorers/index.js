import { getEtherScanFetcher } from './ethereum';
import { getBitcoinTransactionFromApi } from './explorer';
import { TRANSACTION_APIS } from '../constants';

const BitcoinTransactionAPIArray = [
  TRANSACTION_APIS.Blockcypher,
  TRANSACTION_APIS.Bitpay,
  TRANSACTION_APIS.Blockexplorer,
  TRANSACTION_APIS.Blockstream
];

function explorerFactory (TransactionAPIArray) {
  return TransactionAPIArray
    .map(transactionAPI =>
      (transactionId, chain) => getBitcoinTransactionFromApi(TRANSACTION_APIS.Blockexplorer, transactionId, chain)
    );
}

const BitcoinExplorers = explorerFactory(BitcoinTransactionAPIArray);
const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBitcoinTransactionFromApi(TRANSACTION_APIS.Blockcypher, transactionId, chain)
];

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
