import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import BlockcertsStatusList2021Suspension from '../../fixtures/blockcerts-status-list-2021-suspension.json';
import { checkRevocationStatusList2021 } from '../../../src/inspectors';
import FIXTURES from '../../fixtures';

describe('checkRevocationStatusList2021 inspector test suite', function () {
  let requestStub: sinon.SinonStub;

  beforeEach(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('when the revocation list has been tampered with', function () {
    it('should throw', async function () {
      const temperedList = JSON.parse(JSON.stringify(BlockcertsStatusList2021));
      temperedList.credentialSubject.encodedList = 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA';
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(temperedList));

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('The authenticity of the revocation list could not be verified.');
    });
  });

  describe('when no revocation list could be retrieved', function () {
    it('should throw', async function () {
      const temperedList = JSON.parse(JSON.stringify(BlockcertsStatusList2021));
      temperedList.credentialSubject.encodedList = 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA';
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(undefined);

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('No status list could be found at the specified URL for \'statusListCredential\': https://www.blockcerts.org/samples/3.0/status-list-2021.json.');
    });
  });

  describe('when the certificate has been revoked', function () {
    it('should throw', async function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(BlockcertsStatusList2021));

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('Certificate has been revoked.');
    });
  });

  describe('when the certificate has been suspended', function () {
    it('should throw', async function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(BlockcertsStatusList2021));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021-suspension.json'
      }).resolves(JSON.stringify(BlockcertsStatusList2021Suspension));

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021Suspended.credentialStatus);
      }).rejects.toThrow('Certificate has been suspended.');
    });
  });

  describe('when the certificate has not been revoked nor suspended', function () {
    it('should verify', async function () {
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(BlockcertsStatusList2021));

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021.credentialStatus);
      }).resolves;
    });
  });
});
