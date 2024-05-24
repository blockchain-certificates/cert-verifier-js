import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { type VCCredentialSchema } from '../../../src/models/BlockcertsV3';
import checkCredentialSchemaConformity from '../../../src/inspectors/checkCredentialSchemaConformity';

describe('checkCredentialSchemaConformity inspector test suite', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://path.to.non.json.schema') {
            return 'not a json file';
          }

          if (url === 'https://path.to.json.schema') {
            return JSON.stringify({
              $schema: 'http://json-schema.org/draft-04/schema#',
              type: 'object',
              properties: {
                id: {
                  type: 'string'
                },
                name: {
                  type: 'string'
                }
              },
              required: [
                'id',
                'name'
              ]
            });
          }
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  describe('when the schema url does not return a proper json object', function () {
    it('should throw an error', async function () {
      const credentialSchema: VCCredentialSchema = {
        type: 'JsonSchema',
        id: 'https://path.to.non.json.schema'
      };

      const credentialSubject = {
        name: 'John Doe'
      };

      await expect(async () => {
        await checkCredentialSchemaConformity(credentialSubject, credentialSchema);
      }).rejects.toThrow('Specified schema at url: https://path.to.non.json.schema could not be parsed');
    });
  });

  describe('when the credentialSubject object does not comply with the json schema', function () {
    it('should throw an error', async function () {
      const credentialSchema: VCCredentialSchema = {
        type: 'JsonSchema',
        id: 'https://path.to.json.schema'
      };

      const credentialSubject = {
        name: 'John Doe'
      };

      await expect(async () => {
        await checkCredentialSchemaConformity(credentialSubject, credentialSchema);
      }).rejects.toThrow('This certificate does not conform with the provided credential schema');
    });
  });

  describe('when the credentialSubject object complies with the json schema', function () {
    it('should not throw', async function () {
      const credentialSchema: VCCredentialSchema = {
        type: 'JsonSchema',
        id: 'https://path.to.json.schema'
      };

      const credentialSubject = {
        id: 'urn:uuid:123456789',
        name: 'John Doe'
      };

      let failed = false;

      try {
        await checkCredentialSchemaConformity(credentialSubject, credentialSchema);
      } catch {
        failed = true;
      }

      expect(failed).toBe(false);
    });
  });
});
