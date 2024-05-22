import { describe, it, expect, beforeAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { type VCCredentialSchema } from '../../../src/models/BlockcertsV3';
import checkCredentialSchemaConformity from '../../../src/inspectors/checkCredentialSchemaConformity';

describe('checkCredentialSchemaConformity inspector test suite', function () {
  let requestStub;

  beforeAll(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
  });

  describe('when the schema url does not return a proper json object', function () {
    it('should throw an error', async function () {
      requestStub.withArgs({
        url: 'https://path.to.json.schema'
      }).resolves('not a json file');

      const credentialSchema: VCCredentialSchema = {
        type: 'JsonSchema',
        id: 'https://path.to.json.schema'
      };

      const credentialSubject = {
        name: 'John Doe'
      };

      await expect(async () => {
        await checkCredentialSchemaConformity(credentialSubject, credentialSchema);
      }).rejects.toThrow('Specified schema at url: https://path.to.json.schema could not be parsed');
    });
  });

  describe('when the credentialSubject object does not comply with the json schema', function () {
    it('should throw an error', async function () {
      requestStub.withArgs({
        url: 'https://path.to.json.schema'
      }).resolves(JSON.stringify({
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
      }));

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
      requestStub.withArgs({
        url: 'https://path.to.json.schema'
      }).resolves(JSON.stringify({
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
      }));

      const credentialSchema: VCCredentialSchema = {
        type: 'JsonSchema',
        id: 'https://path.to.json.schema'
      };

      const credentialSubject = {
        id: 'urn:uuid:123456789',
        name: 'John Doe'
      };

      expect(async () => {
        await checkCredentialSchemaConformity(credentialSubject, credentialSchema);
      }).not.toThrow();
    });
  });
});
