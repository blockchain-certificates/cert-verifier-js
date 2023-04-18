import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import MainnetInvalidMerkleReceipt from '../../fixtures/v2/mainnet-invalid-merkle-receipt-2.0.json';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';

describe('given the certificate is a mainnet with an invalid merkle receipt', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: 'f029b45bb1a7b1f0b970f6de35344b73cccd16177b4c037acbc2541c7fc27078',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-06-29T22:10:29.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
    }).resolves(JSON.stringify(issuerBlockcertsV2a));
    certificate = new Certificate(MainnetInvalidMerkleReceipt);
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
