import { getTransactionFromApi } from './explorer';
import { TRANSACTION_APIS } from '../constants';

const BitcoinTransactionAPIArray = [
  TRANSACTION_APIS.Blockcypher,
  TRANSACTION_APIS.Bitpay,
  TRANSACTION_APIS.Blockexplorer,
  TRANSACTION_APIS.Blockstream
];

const EthereumTransactionAPIArray = [
  TRANSACTION_APIS.Etherscan
];

function explorerFactory (TransactionAPIArray) {
  return TransactionAPIArray
    .map(transactionAPI =>
      (transactionId, chain) => getTransactionFromApi(transactionAPI, transactionId, chain)
    );
}

const BitcoinExplorers = explorerFactory(BitcoinTransactionAPIArray);
const EthereumExplorers = explorerFactory(EthereumTransactionAPIArray);

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = explorerFactory([TRANSACTION_APIS.Blockcypher]);

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
