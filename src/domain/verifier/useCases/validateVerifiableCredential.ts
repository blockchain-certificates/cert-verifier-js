import { CONTEXT_URLS } from '@blockcerts/schemas';
import { isValidUrl } from '../../../helpers/url';
import type {
  BlockcertsV3,
  VerifiablePresentation, VCProof, VCObject
} from '../../../models/BlockcertsV3';
import type { JsonLDContext } from '../../../models/Blockcerts';
import { type Issuer } from '../../../models/Issuer';
import { isVerifiablePresentation } from '../../../models/BlockcertsV3';

function validateRFC3339Date (date: string): boolean {
  const regex = /^-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))$/;
  return regex.test(date);
}

function isV1VerifiableCredential (context: JsonLDContext): boolean {
  return context.includes(CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT);
}

function isV2VerifiableCredential (context: JsonLDContext): boolean {
  return context.includes(CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT);
}

function validateUrl (url: string, property: string = ''): void {
  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}. ${property ? `Property: ${property}` : ''}`);
  }
}

function validateType (certificateType: string[]): void {
  const compulsoryTypes = ['VerifiableCredential', 'VerifiablePresentation'];
  if (!Array.isArray(certificateType)) {
    throw new Error('`type` property must be an array');
  }
  const containsCompulsoryTypes = compulsoryTypes.filter(type => certificateType.includes(type));
  if (certificateType.length === 0 || containsCompulsoryTypes.length === 0) {
    throw new Error('`type` property must include `VerifiableCredential` or `VerifiablePresentation`');
  }
}

function validateContext (context: JsonLDContext, type: string[]): void {
  const vcContextUrls: string[] = [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT, CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT];

  if (!Array.isArray(context)) {
    throw new Error('`@context` property must be an array');
  }
  if (!vcContextUrls.includes(context[0] as string)) {
    throw new Error(`First @context must be one of ${vcContextUrls.join(', ')}, given ${context[0] as string}`);
  }
  if (isV1VerifiableCredential(context) && isV2VerifiableCredential(context)) {
    throw new Error('Cannot have both v1 and v2 Verifiable Credential contexts');
  }
  if (type.length > 1 && context.length === 1) {
    throw new Error(`More specific type: ${type[1]} was detected but no additional context provided`);
  }
}

function validateIssuer (certificateIssuer: string | Issuer): void {
  let hasError = false;
  if (certificateIssuer == null) {
    hasError = true;
  } else if (typeof certificateIssuer === 'string' && !isValidUrl(certificateIssuer)) {
    hasError = true;
  } else if (typeof certificateIssuer === 'object' && !isValidUrl(certificateIssuer.id)) {
    hasError = true;
  } else if (Array.isArray(certificateIssuer)) {
    hasError = true;
  }

  if (hasError) {
    throw new Error('`issuer` must be a URL string or an object with an `id` URL string');
  }
}

function validateDateRFC3339StringFormat (date: string, propertyName: string): void {
  let errorMessage = `${propertyName} must be a valid RFC3339 string.`;
  if (typeof date !== 'string') {
    errorMessage += `${propertyName}: ${date as any} is not a string`;
    throw new Error(errorMessage);
  }
  if (!validateRFC3339Date(date)) {
    errorMessage += ` Received: \`${date}\``;
    throw new Error(errorMessage);
  }
}

function validateCredentialSubject (credentialSubject: any): void {
  if (typeof credentialSubject !== 'object') {
    throw new Error('`credentialSubject` must be an object');
  }

  if (Array.isArray(credentialSubject) && credentialSubject.length === 0) {
    throw new Error('`credentialSubject` cannot be an empty array');
  }

  if (Array.isArray(credentialSubject)) {
    credentialSubject.forEach(subject => {
      validateCredentialSubject(subject);
    });
  }
}

function validatePropTypeAndId (prop: VCObject | VCObject[], propName: string): void {
  const props = Array.isArray(prop) ? prop : [prop];
  props.forEach(p => {
    console.log('validating prop', propName, p);
    if (!p.id) {
      throw new Error(`${propName}.id must be defined`);
    }
    validateUrl(p.id, `${propName}.id`);
    if (!p.type) {
      throw new Error(`${propName}.type must be defined`);
    }
  });
}

function validateProof (proof: VCProof): void {
  if (!proof.created) {
    throw new Error('`proof.created` must be defined');
  }

  if (!proof.proofPurpose) {
    throw new Error('`proof.proofPurpose` must be defined');
  }
}

export default function validateVerifiableCredential (credential: BlockcertsV3 | VerifiablePresentation): void {
  if (isVerifiablePresentation(credential)) {
    // verifiableCredential property is optional
    if (credential.verifiableCredential) {
      credential.verifiableCredential.forEach(vc => {
        validateVerifiableCredential(vc);
      });
    }
    return;
  }

  if (!credential.credentialSubject) {
    throw new Error('`credentialSubject` must be defined');
  }

  validateCredentialSubject(credential.credentialSubject);

  validateType(credential.type);
  validateContext(credential['@context'], credential.type);

  validateIssuer(credential.issuer);

  if (isV1VerifiableCredential(credential['@context'])) {
    if (credential.issuanceDate) {
      validateDateRFC3339StringFormat(credential.issuanceDate, 'issuanceDate');
    }
    if (credential.expirationDate) {
      validateDateRFC3339StringFormat(credential.expirationDate, 'expirationDate');
    }
  }
  if (isV2VerifiableCredential(credential['@context'])) {
    if (credential.validFrom) {
      validateDateRFC3339StringFormat(credential.validFrom, 'validFrom');
    }
    if (credential.validUntil) {
      validateDateRFC3339StringFormat(credential.validUntil, 'validUntil');
    }
  }

  if (credential.credentialStatus) {
    validatePropTypeAndId(credential.credentialStatus, 'credentialStatus');
  }

  if (credential.credentialSchema) {
    validatePropTypeAndId(credential.credentialSchema, 'credentialSchema');
  }

  if (credential.termsOfUse) {
    validatePropTypeAndId(credential.termsOfUse, 'termsOfUse');
  }

  if (credential.evidence) {
    validatePropTypeAndId(credential.evidence, 'evidence');
  }

  if (credential.refreshService) {
    validatePropTypeAndId(credential.refreshService, 'refreshService');
  }

  if (!credential.proof) {
    throw new Error('`proof` must be defined');
  }

  let { proof } = credential;
  if (!Array.isArray(proof)) {
    proof = [proof];
  }
  proof.forEach(p => {
    validateProof(p);
  });
}
