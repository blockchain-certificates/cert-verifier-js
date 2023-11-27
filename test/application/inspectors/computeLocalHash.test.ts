import blockcertsV1Fixture from '../../fixtures/v1/mainnet-valid-1.2.json';
import computeLocalHash, { getUnmappedFields } from '../../../src/inspectors/computeLocalHash';

describe('computeLocalHash test suite', function () {
  let fixture;
  beforeEach(function () {
    fixture = Object.assign({}, blockcertsV1Fixture);
  });

  describe('given it receives a document', function () {
    it('should return the SHA-256 hashed version', async function () {
      const output = await computeLocalHash(fixture);
      expect(output).toBe('c9ead76a54426b4ce4899bb921e48f5b55ea7592e5cee4460c86ebf4698ac3a6');
    });
  });

  xdescribe('given it receives the document has unmapped fields', function () {
    // disabled as we disabled safe mode for legacy certs that may have unmapped fields
    it('should throw', async function () {
      fixture.testUnmapped = 'this field is not mapped';
      await expect(async () => {
        await computeLocalHash(fixture);
      }).rejects.toThrow('Found unmapped fields during JSON-LD normalization: testUnmapped');
    });
  });

  describe('getUnmappedFields method', function () {
    describe('given it finds no unmapped fields', function () {
      it('should return null', function () {
        const testString = '<did:example:ebfeb1f712ebc6f1c276e12ec21> <https://schema.org/name> "Julien Fraichot" .';
        expect(getUnmappedFields(testString)).toEqual(null);
      });
    });

    describe('given it finds some unmapped fields', function () {
      it('should return a sorted list of the fields', function () {
        const testString = `<did:example:ebfeb1f712ebc6f1c276e12ec21> <https://schema.org/name> "Julien Fraichot" .
            <did:example:ebfeb1f712ebc6f1c276e12ec21> <http://fallback.org/surname> "Fraichot" .
            <did:example:ebfeb1f712ebc6f1c276e12ec21> <http://fallback.org/email> "julien.fraichot@hyland.com" .`;
        expect(getUnmappedFields(testString)).toEqual(['email', 'surname']);
      });

      describe('and some fields are duplicated', function () {
        it('should return a list of deduped fields', function () {
          const testString = `<did:example:ebfeb1f712ebc6f1c276e12ec21> <http://fallback.org/email> "julien.fraichot@hyland.com" .
             <did:example:ebfeb1f712ebc6f1c276e12ec21> <https://schema.org/name> "Julien Fraichot" .
             <https://auto-certificates.learningmachine.io/issuer/c6890ca6-ed91-de07-3b61-71702b9cbd3f.json> <http://fallback.org/email> "julien.fraichot@hyland.com" .`;
          expect(getUnmappedFields(testString)).toEqual(['email']);
        });
      });
    });
  });
});
