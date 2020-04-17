import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import sinon from 'sinon';
import * as explorer from '../../../src/explorers/explorer';

describe('given the certificate is a valid mainnet (v2.0)', function () {
  it('should verify successfully', async function () {
    sinon.stub(explorer, 'getTransactionFromApi').resolves({
      remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
      issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      time: '2018-02-08T00:23:34.000Z',
      revokedAddresses: [
        '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
      ]
    });
    const certificate = new Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
