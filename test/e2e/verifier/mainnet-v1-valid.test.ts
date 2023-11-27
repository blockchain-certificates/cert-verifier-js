import sinon from 'sinon';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import { type TransactionData } from '../../../src/models/TransactionData';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import fixtureIssuerProfile from '../../fixtures/v1/got-issuer_live.json';
import fixtureBlockcertsV1 from '../../fixtures/v1/mainnet-valid-1.2.json';

describe('given the certificate is a valid testnet (v1.2)', function () {
  beforeEach(function () {
    const cachedTransactionData: TransactionData = {
      remoteHash: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
      issuingAddress: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619',
      time: '2016-10-03T19:52:55.000Z',
      revokedAddresses: []
    };
    sinon.stub(domain.verifier, 'lookForTx').resolves(cachedTransactionData);
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should verify successfully', async function () {
    const certificate = new Certificate(fixtureBlockcertsV1 as any);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
