import {describe, expect, it} from 'vitest';
import resolveDidKeyDocument from '../../../../../src/domain/did/useCases/resolveDidKeyDocument';
import didDocumentSecp256k1 from '../../../../assertions/did:key:zQ3shWbMURApEGeYEYbyfMoPbuW5qCmM7gtWkwnhGf2LLkv2M.json';
import didDocumentEd25519 from '../../../../fixtures/did/did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs';

describe('resolveDidKeyDocument DID domain useCase test suite', function () {
  it('resolves a DID document from a secp256k1 key', async function () {
    const result = await resolveDidKeyDocument('did:key:zQ3shWbMURApEGeYEYbyfMoPbuW5qCmM7gtWkwnhGf2LLkv2M');
    expect(result).toEqual(didDocumentSecp256k1);
  });

  it.only('resolves a DID document from a ed25519 key', async function () {
    const result = await resolveDidKeyDocument('did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs');
    expect(result).toEqual(didDocumentEd25519);
  });
});
