import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import blockcypherResponse from '../../data/v1.2-blockcypher-response';
import stubRequest from '../../__helpers/stubRequest';

describe('given the certificate is a valid testnet (v1.2)', function () {
  stubRequest('https://api.blockcypher.com/v1/btc/main/txs/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d?limit=500', blockcypherResponse);

  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.TestnetV1Valid);
    const result = await certificate.verify();
    console.log(result);
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
