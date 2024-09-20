import { describe, expect, it } from 'vitest';
import domain from '../../../../../src/domain';
import expectedDidDoc from '../../../../fixtures/did/did:tdw:Qmcox8WT7JK9zaWWcmVFyQE3npmxSzHsB54GZjFp5uFBRn:blockcerts.org/did.json';

describe('resolveDidTdw function', function () {
  it('should return the correct DID doc for a given did', async function () {
    // TODO: potentially mock the didLog retrieval to cut out from the internet.
    //  It's a JSONL file so we need a way to load it into the mock response.
    const did = 'did:tdw:QmPUAJjDjEaEX7EAMdeTuFD8FHCv8tchvNDM64YEXNcVkt:blockcerts.org';
    const resolved = await domain.did.resolveDidTdw(did);
    expect(resolved.doc).toEqual(expectedDidDoc);
  });
});
