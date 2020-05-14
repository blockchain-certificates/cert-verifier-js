import { TransactionData } from '../../../../src/models/TransactionData';
import { explorerApi as BlockcyperETHApi } from '../../../../src/explorers/ethereum/blockcypher';

const responseData = {
  block_hash: '43bc69984a1ef0b160eeb5bc9cbda4d6ea7cdc01645300c50f398f234acfb3ae',
  block_height: 5715803,
  block_index: 14,
  hash: 'a12c498c8fcf59ee2fe785c94c38be4797fb027e6450439a7ef30ad61d7616d3',
  addresses: [
    '3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
    'deaddeaddeaddeaddeaddeaddeaddeaddeaddead'
  ],
  total: 0,
  fees: 463520000000000,
  size: 134,
  gas_limit: 25000,
  gas_used: 23176,
  gas_price: 20000000000,
  confirmed: '2018-06-01T20:47:55Z',
  received: '2018-06-01T20:47:55Z',
  ver: 0,
  double_spend: false,
  vin_sz: 1,
  vout_sz: 1,
  confirmations: 4348656,
  confidence: 1,
  inputs: [
    {
      sequence: 2,
      addresses: [
        '3d995ef85a8d1bcbed78182ab225b9f88dc8937c'
      ]
    }
  ],
  outputs: [
    {
      value: 0,
      script: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
      addresses: [
        'deaddeaddeaddeaddeaddeaddeaddeaddeaddead'
      ]
    }
  ]
};

describe('Blockcypher Ethereum explorer test suite', function () {
  describe('given it is called with response data from the API', function () {
    it('should return the correct TransactionData', async function () {
      const expectedOutput: TransactionData = {
        revokedAddresses: [],
        remoteHash: 'ec049a808a09f3e8e257401e0898aa3d32a733706fd7d16aacf0ba95f7b42c0c',
        issuingAddress: '0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c',
        time: new Date('2018-06-01T20:47:55.000Z')
      };

      const output: TransactionData = await BlockcyperETHApi.parsingFunction(responseData);

      expect(output).toEqual(expectedOutput);
    });
  });
});
