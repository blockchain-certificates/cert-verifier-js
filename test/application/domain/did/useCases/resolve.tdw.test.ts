import { describe, expect, it } from 'vitest';
import domain from '../../../../../src/domain';
import expectedDidDoc from '../../../../fixtures/did/did:tdw:QmfKd3jdBU6LZYyQAP7pQL3X8aEgfqrc9YGiy6Z3om4B3N:blockcerts.org.json';

describe('resolveDidTdw function', function () {
  it('should return the correct DID doc for a given did', async function () {
    const did = 'did:tdw:QmPUAJjDjEaEX7EAMdeTuFD8FHCv8tchvNDM64YEXNcVkt:blockcerts.org';
    const resolved = await domain.did.resolveDidTdw(did);
    expect(resolved.doc).toEqual(expectedDidDoc);
  });
});
