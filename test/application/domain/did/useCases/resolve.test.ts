import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import sinon from 'sinon';
import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document-btc-addresses.json';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../../../src/domain/did/valueObjects/didResolver';

describe('domain did resolve test suite', function () {
  let requestStub;
  const didUri = 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q';

  beforeEach(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
  });

  afterEach(function () {
    requestStub.restore();
  });

  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      requestStub.withArgs({ url: `${universalResolverUrl}/${didUri}` }).resolves(JSON.stringify({ didDocument: assertionIonDidDocument }));
      const didDocument = await domain.did.resolve(didUri);
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });

  describe('custom resolver option', function () {
    beforeEach(function () {
      requestStub.resolves('{}');
    });

    describe('given no custom resolver is specified', function () {
      it('should default to the DIF universal resolver', async function () {
        await domain.did.resolve(didUri);
        expect(requestStub.getCall(0).args[0].url).toBe(`${universalResolverUrl}/${didUri}`);
      });
    });

    describe('given a custom resolver is specified', function () {
      it('should use the custom resolver address', async function () {
        const customResolverUrl = 'https://resolver.blockcerts.org';
        await domain.did.resolve(didUri, customResolverUrl);
        expect(requestStub.getCall(0).args[0].url).toBe(`${customResolverUrl}/${didUri}`);
      });
    });
  });
});
