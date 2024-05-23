import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document-btc-addresses.json';
import { universalResolverUrl } from '../../../../../src/domain/did/valueObjects/didResolver';

// vi.mock is hoisted so we need to declare those properties at the top level scope
const didUri = 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q';
const spy = vi.fn();

describe('domain did resolve test suite', function () {

  beforeEach(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          spy(url); // passing url argument to spy for later comparison
          if (url === `${universalResolverUrl}/${didUri}`) {
            return JSON.stringify({ didDocument: assertionIonDidDocument });
          }

          return '{}';
        }
      };
    });
  });

  afterEach(function () {
    spy.mockClear();
    vi.restoreAllMocks();
  });

  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      const didDocument = await domain.did.resolve(didUri);
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });

  describe('custom resolver option', function () {
    describe('given no custom resolver is specified', function () {
      it('should default to the DIF universal resolver', async function () {
        await domain.did.resolve(didUri);
        expect(spy.mock.calls[0][0]).toBe(`${universalResolverUrl}/${didUri}`);
      });
    });

    describe('given a custom resolver is specified', function () {
      it('should use the custom resolver address', async function () {
        const customResolverUrl = 'https://resolver.blockcerts.org';
        await domain.did.resolve(didUri, customResolverUrl);
        expect(spy.mock.calls[0][0]).toBe(`${customResolverUrl}/${didUri}`);
      });
    });
  });
});
