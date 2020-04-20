import { getTransactionFromApi } from './explorer';
import { TRANSACTION_APIS } from '../constants';
import { TransactionData } from '../models/TransactionData';

const BitcoinTransactionAPIArray = [
  TRANSACTION_APIS.Blockcypher,
  TRANSACTION_APIS.Bitpay,
  TRANSACTION_APIS.Blockexplorer,
  TRANSACTION_APIS.Blockstream
];

const EthereumTransactionAPIArray = [
  TRANSACTION_APIS.Etherscan
];

export type TExplorerFunctionsArray = {(transactionId: string, chain: any): Promise<TransactionData>}[];

function explorerFactory (TransactionAPIArray): TExplorerFunctionsArray {
  return TransactionAPIArray
    .map(transactionAPI =>
      (transactionId, chain) => getTransactionFromApi(transactionAPI, transactionId, chain)
    );
}

const BitcoinExplorers: TExplorerFunctionsArray = explorerFactory(BitcoinTransactionAPIArray);
const EthereumExplorers: TExplorerFunctionsArray = explorerFactory(EthereumTransactionAPIArray);

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo: TExplorerFunctionsArray = explorerFactory([TRANSACTION_APIS.Blockcypher]);

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
