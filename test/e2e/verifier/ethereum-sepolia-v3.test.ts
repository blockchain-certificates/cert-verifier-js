import { describe, it, expect } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import EthereumSepoliaV3 from '../../fixtures/v3/ethereum-sepolia-v3.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is a valid Sepolia anchored v3 certs', function () {
  it('should verify successfully', async function () {
    sinon.stub(ExplorerLookup, 'lookForTx').resolves({
      remoteHash: 'b2c64ed78cccda992431c265a1d0bb657e8cefd14b1ef15ceadcc697c566994f',
      issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
      time: '2022-11-02T02:33:24.000Z',
      revokedAddresses: []
    });
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    const certificate = new Certificate(EthereumSepoliaV3);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    sinon.restore();
  });
});
