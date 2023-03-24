import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import BlockcertsStatusList2021 from '../../fixtures/blockcerts-status-list-2021.json';
import { checkRevocationStatusList2021 } from '../../../src/inspectors';
import FIXTURES from '../../fixtures';

describe('checkRevocationStatusList2021 inspector test suite', function () {
  describe('when the revocation list has been tampered with', function () {
    it('should throw', async function () {
      const temperedList = JSON.parse(JSON.stringify(BlockcertsStatusList2021));
      console.log(BlockcertsStatusList2021);
      temperedList.credentialSubject.encodedList = 'H4sIAAAAAAAAA-3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAIC3AYbSVKsAQAAA';
      console.log(temperedList);
      const requestStub = sinon.stub(ExplorerLookup, 'request');
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/status-list-2021.json'
      }).resolves(JSON.stringify(temperedList));

      await expect(async () => {
        await checkRevocationStatusList2021(FIXTURES.StatusList2021Revoked.credentialStatus);
      }).rejects.toThrow('The authenticity of the revocation list could not be verified.');
      sinon.restore();
    });
  });
});
