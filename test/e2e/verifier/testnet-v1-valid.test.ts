/* eslint @typescript-eslint/camelcase: 0 */
import sinon from 'sinon';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';
import * as VerifierUseCases from '../../../src/domain/verifier/useCases';
import v1_2IssuerProfile from '../../data/v1.2-issuer-profile.json';
import { TransactionData } from '../../../src/models/TransactionData';

describe('given the certificate is a valid testnet (v1.2)', function () {
  beforeEach(function () {
    const cachedTransactionData: TransactionData = {
      remoteHash:
        '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
      issuingAddress: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619',
      time: '2016-10-03T19:37:59.141Z',
      revokedAddresses: ['1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619']
    };
    sinon.stub(domain.verifier, 'lookForTx').resolves(cachedTransactionData);
    sinon.stub(VerifierUseCases, 'getIssuerProfile').resolves(v1_2IssuerProfile);
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should verify successfully', async function () {
    const certificate = new Certificate(FIXTURES.TestnetV1Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
