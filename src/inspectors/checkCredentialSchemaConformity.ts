import { validator } from '@exodus/schemasafe';
import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../models';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import { getText } from '../domain/i18n/useCases';
import type { VCCredentialSchema } from '../models/BlockcertsV3';

export default async function checkCredentialSchemaConformity (credentialSubject: any, credentialSchema: VCCredentialSchema | VCCredentialSchema[]): Promise<void> {
  if (!Array.isArray(credentialSchema)) {
    credentialSchema = [credentialSchema];
  }

  for (const schemaInfo of credentialSchema) {
    const rawSchema = await request({ url: schemaInfo.id });
    let schema;
    try {
      schema = JSON.parse(rawSchema);
    } catch (e) {
      console.error(e);
      throw new Error(`Specified schema at url: ${schemaInfo.id} could not be parsed`);
    }

    const validate = validator(schema);
    const result = validate(credentialSubject);
    if (!result) {
      throw new VerifierError(SUB_STEPS.checkCredentialSchemaConformity, getText('errors', 'checkCredentialSchemaConformity'));
    }
  }
}
