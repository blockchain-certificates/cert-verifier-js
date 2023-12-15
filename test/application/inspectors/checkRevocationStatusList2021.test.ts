import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { checkRevocationStatusList2021 } from '../../../src/inspectors';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import StatusList2021Revoked from '../../fixtures/v3/cert-rl-status-list-2021-revoked.json';
import StatusList2021Suspended from '../../fixtures/v3/cert-rl-status-list-2021-suspended.json';
import StatusList2021 from '../../fixtures/v3/cert-rl-status-list-2021.json';

describe('checkRevocationStatusList2021 inspector test suite', function () {
  let requestStub: sinon.SinonStub;

  beforeAll(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
    }).resolves(JSON.stringify(BlockcertsStatusList2021));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
    }).resolves(JSON.stringify(BlockcertsStatusList2021Suspension));
  });

  afterAll(function () {
    sinon.restore();
  });

  describe('when the certificate has been revoked', function () {
    it('should throw', async function () {
      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('This certificate has been revoked by the issuer.');
    });
  });

  describe('when the certificate has been suspended', function () {
    it('should throw', async function () {
      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Suspended.credentialStatus);
      }).rejects.toThrow('This certificate has been suspended by the issuer.');
    });
  });

  describe('when the certificate has not been revoked nor suspended', function () {
    it('should verify', async function () {
      // eslint-disable-next-line   @typescript-eslint/await-thenable
      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021.credentialStatus);
      }).resolves;
    });
  });

  describe('when the revocation list has been tampered with', function () {
    it('should throw', async function () {
      const tamperedList = JSON.parse(JSON.stringify(BlockcertsStatusList2021));
      tamperedList.credentialSubject.encodedList = 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA';
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(tamperedList));

      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('The authenticity of the revocation list could not be verified.');
    });
  });

  describe('when no revocation list could be retrieved', function () {
    it('should throw', async function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(undefined);

      await expect(async () => {
        await checkRevocationStatusList2021(StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('No status list could be found at the specified URL for \'statusListCredential\': https://www.blockcerts.org/samples/3.0/status-list-2021.json.');
    });
  });
});
