/**
 * Problem type URIs, per the W3C VC Data Model 2.0 Problem Details algorithm:
 * https://www.w3.org/TR/vc-data-model-2.0/#problem-details
 *
 * The base VC-DM types are defined by the specification. Additional types are
 * library-specific extensions, as explicitly permitted by the spec's
 * "Implementations MAY extend the ProblemDetails object" guidance.
 */
export enum ProblemDetailsType {
  // W3C VC Data Model 2.0 standard problem types
  PARSING_ERROR = 'https://www.w3.org/TR/vc-data-model#PARSING_ERROR',
  CRYPTOGRAPHIC_SECURITY_ERROR = 'https://www.w3.org/TR/vc-data-model#CRYPTOGRAPHIC_SECURITY_ERROR',
  MALFORMED_VALUE_ERROR = 'https://www.w3.org/TR/vc-data-model#MALFORMED_VALUE_ERROR',
  RANGE_ERROR = 'https://www.w3.org/TR/vc-data-model#RANGE_ERROR',

  // W3C Bitstring Status List v1.0, §3.5 Processing Errors
  // https://www.w3.org/TR/vc-bitstring-status-list/#processing-errors
  STATUS_RETRIEVAL_ERROR = 'https://www.w3.org/ns/credentials/status-list#STATUS_RETRIEVAL_ERROR',
  STATUS_VERIFICATION_ERROR = 'https://www.w3.org/ns/credentials/status-list#STATUS_VERIFICATION_ERROR',
  STATUS_LIST_LENGTH_ERROR = 'https://www.w3.org/ns/credentials/status-list#STATUS_LIST_LENGTH_ERROR',

  // W3C VC Data Integrity, §4.7 Processing Errors
  // https://www.w3.org/TR/vc-data-integrity/#processing-errors
  // Per the spec, these type URLs MUST start with https://w3id.org/security#
  PROOF_VERIFICATION_ERROR = 'https://w3id.org/security#PROOF_VERIFICATION_ERROR',
  PROOF_TRANSFORMATION_ERROR = 'https://w3id.org/security#PROOF_TRANSFORMATION_ERROR'
}

export interface ProblemDetails {
  type: ProblemDetailsType | string;
  title?: string;
  detail?: string;
}
