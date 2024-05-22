import { describe, it, expect } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import fixtureIssuerProfile from '../../fixtures/issuer-profile-mainnet-example.json';
import MainnetV2Valid from '../../fixtures/v2/mainnet-valid-2.0.json';

describe('given the certificate is a valid mainnet (v2.0)', function () {
  it('should verify successfully', async function () {
    sinon.stub(domain.verifier, 'lookForTx').resolves({
      remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
      issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
      time: '2018-02-08T00:23:34.000Z',
      revokedAddresses: [
        '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
      ]
    });
    sinon.stub(ExplorerLookup, 'request').withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    const certificate = new Certificate(MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
