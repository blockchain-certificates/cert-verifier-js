import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import domain from '../../../src/domain';

describe('given the certificate is a valid testnet (v3.0b)', function () {
  it('should verify successfully', async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: '2c7afa4f8192bd8d0e243da2044306b2183527270ef6fd76854c34a1288756ba',
      issuingAddress: 'n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4',
      time: '2021-04-27T15:58:48.000Z',
      revokedAddresses: ['n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4']
    });
    const certificate = new Certificate(FIXTURES.BlockcertsV3Beta);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
