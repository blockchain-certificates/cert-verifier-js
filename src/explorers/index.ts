import { getTransactionFromApi } from './explorer';
import { TRANSACTION_APIS } from '../constants';
import { TransactionData } from '../models/TransactionData';
import { SupportedChains } from '../constants/blockchains';
import * as BitPayApi from './bitcoin/bitpay';
import * as BlockCypherApi from './bitcoin/blockcypher';
import * as BlockExplorerApi from './bitcoin/blockexplorer';
import * as BlockstreamApi from './bitcoin/blockstream';
import * as EtherscanApi from './ethereum/etherscan';
import { ExplorerAPI } from '../certificate';

const BitcoinTransactionAPIArray = [
  BlockCypherApi,
  BitPayApi,
  BlockExplorerApi,
  BlockstreamApi
];

const EthereumTransactionAPIArray = [
  EtherscanApi
];

export type TExplorerFunctionsArray = {(transactionId: string, chain: SupportedChains): Promise<TransactionData>}[];

function explorerFactory (TransactionAPIArray: ExplorerAPI[]): TExplorerFunctionsArray {
  return TransactionAPIArray
    .map(explorerAPI =>
      (transactionId, chain) => getTransactionFromApi(explorerAPI, transactionId, chain)
    );
}

const BitcoinExplorers: TExplorerFunctionsArray = explorerFactory(BitcoinTransactionAPIArray);
const EthereumExplorers: TExplorerFunctionsArray = explorerFactory(EthereumTransactionAPIArray);

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo: TExplorerFunctionsArray = explorerFactory([BlockCypherApi]);

export { BitcoinExplorers, EthereumExplorers, BlockchainExplorersWithSpentOutputInfo };
