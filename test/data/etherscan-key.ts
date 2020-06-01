import { ExplorerAPI } from '../../src';
import { TRANSACTION_APIS } from '../../src/constants/api';

const etherscanApiWithKey: ExplorerAPI = {
  serviceName: TRANSACTION_APIS.etherscan,
  key: 'FJ3CZWH8PQBV8W5U6JR8TMKAYDHBKQ3B1D',
  keyPropertyName: 'apikey'
};

export default etherscanApiWithKey;
