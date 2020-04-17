import * as BitPayApi from './bitcoin/bitpay';
import * as BlockCypherApi from './bitcoin/blockcypher';
import * as BlockExplorerApi from './bitcoin/blockexplorer';
import * as BlockstreamApi from './bitcoin/blockstream';
import * as EtherscanApi from './ethereum/etherscan';
import { TRANSACTION_APIS } from '../constants';

const PublicAPIs = {
  [TRANSACTION_APIS.Bitpay]: BitPayApi,
  [TRANSACTION_APIS.Blockcypher]: BlockCypherApi,
  [TRANSACTION_APIS.Blockexplorer]: BlockExplorerApi,
  [TRANSACTION_APIS.Blockstream]: BlockstreamApi,
  [TRANSACTION_APIS.Etherscan]: EtherscanApi
};

export { PublicAPIs };
