import domain from '../../../src/domain';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import issuerBlockcertsV2a from '../../fixtures/issuer-blockcerts-v2a.json';
import MainnetMerkleRootUmmatch from '../../fixtures/v2/mainnet-merkle-root-unmatch-2.0.json';

describe('given the certificate is a mainnet with a not matching merkle root', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '7570ad1a939b1d733668125df3e71ebbd593358e7d851eff3fdebd487462daab',
      issuingAddress: 'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj',
      time: '2017-05-03T17:06:19.000Z',
      revokedAddresses: [
        'msBCHdwaQ7N2ypBYupkp6uNxtr9Pg76imj'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json'
    }).resolves(JSON.stringify(issuerBlockcertsV2a));
    certificate = new Certificate(MainnetMerkleRootUmmatch);
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
    expect(result.message).toBe('Merkle root does not match remote hash.');
  });
});
