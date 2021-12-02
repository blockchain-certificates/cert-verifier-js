import sinon from 'sinon';
import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document-btc-addresses.json';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../../../src/domain/did/valueObjects/didResolver';

describe('domain did resolve test suite', function () {
  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      const didDocument = await domain.did.resolve('did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q');
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });

  describe('custom resolver option', function () {
    let requestStub;

    beforeEach(function () {
      requestStub = sinon.stub(ExplorerLookup, 'request').resolves('{}');
    });

    afterEach(function () {
      requestStub.restore();
    });

    describe('given no custom resolver is specified', function () {
      it('should default to the DIF universal resolver', async function () {
        const didUri = 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q';
        await domain.did.resolve(didUri);
        expect(requestStub.getCall(0).args[0].url).toBe(`${universalResolverUrl}/${didUri}`);
      });
    });

    describe('given a custom resolver is specified', function () {
      it('should use the custom resolver address', async function () {
        const didUri = 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q';
        const customResolverUrl = 'https://resolver.blockcerts.org';
        await domain.did.resolve(didUri, customResolverUrl);
        expect(requestStub.getCall(0).args[0].url).toBe(`${customResolverUrl}/${didUri}`);
      });
    });
  });
});
