import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as explorer from '../../../src/explorers/explorer';

describe('given the certificate is a mainnet with an invalid merkle receipt', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(explorer, 'getTransactionFromApi').resolves({
      remoteHash: 'f029b45bb1a7b1f0b970f6de35344b73cccd16177b4c037acbc2541c7fc27078',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-06-29T22:10:29.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    certificate = new Certificate(FIXTURES.MainnetInvalidMerkleReceipt);
    await certificate.init();
    result = await certificate.verify();
  });

  afterAll(function () {
    sinon.restore();
  });

  it('should fail', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the error message', function () {
    expect(result.message).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
  });
});
