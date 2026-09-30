import { ProblemDetailsType } from './ProblemDetails';
import type { ProblemDetails } from './ProblemDetails';
import type { CREDENTIAL_STATUS_OPTIONS } from '../domain/certificates/useCases/generateRevocationReason';

export default class VerifierError extends Error {
  public stepCode: string;
  public problemDetails?: ProblemDetails;
  // Set only for checkRevokedStatus failures caused by an actual credentialStatus entry
  // (revoked or suspended), as opposed to other failures on that same step (e.g. an
  // unreachable status list). Lets consumers branch on the outcome without parsing message text.
  public credentialStatus?: CREDENTIAL_STATUS_OPTIONS;

  constructor (stepCode: string, message: string, problemDetailsType?: ProblemDetailsType | string, credentialStatus?: CREDENTIAL_STATUS_OPTIONS) {
    super(message);
    this.stepCode = stepCode;
    if (problemDetailsType) {
      this.problemDetails = {
        type: problemDetailsType,
        detail: message
      };
    }
    if (credentialStatus) {
      this.credentialStatus = credentialStatus;
    }
  }
}
