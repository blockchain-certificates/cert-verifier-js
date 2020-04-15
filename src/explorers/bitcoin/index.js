import * as BitPayApi from './bitpay';
import * as BlockCypherApi from './blockcypher';
import * as BlockExplorerApi from './blockexplorer';
import * as BlockstreamApi from './blockstream';
import { TRANSACTION_APIS } from '../../constants';

const BitcoinAPIs = {
  [TRANSACTION_APIS.Bitpay]: BitPayApi,
  [TRANSACTION_APIS.Blockcypher]: BlockCypherApi,
  [TRANSACTION_APIS.Blockexplorer]: BlockExplorerApi,
  [TRANSACTION_APIS.Blockstream]: BlockstreamApi
};

export { BitcoinAPIs };
