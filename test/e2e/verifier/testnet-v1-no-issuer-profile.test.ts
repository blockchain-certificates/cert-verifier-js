import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import domain from '../../../src/domain';
import { TransactionData } from '../../../src/models/TransactionData';

describe('given the certificate\'s issuer profile no longer exists', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    const cachedTxData: TransactionData = {
      remoteHash: '2ccf4b24fe14efff27064303b153d382bb981a6481742d75d81afdc7a354eda1',
      issuingAddress: 'mmShyF6mhf6LeQzPdEsmiCghhgMuEn9TNF',
      time: '2016-09-29T23:46:25.000Z',
      revokedAddresses: [
        'mmShyF6mhf6LeQzPdEsmiCghhgMuEn9TNF'
      ]
    };
    sinon.stub(domain.verifier, 'lookForTx').resolves(cachedTxData);
    certificate = new Certificate(FIXTURES.TestnetV1NoIssuerProfile);
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
    expect(result.message).toBe('Unable to get issuer profile');
  });
});
