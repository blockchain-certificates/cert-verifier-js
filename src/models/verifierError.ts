import { ProblemDetailsType } from './ProblemDetails';
import type { ProblemDetails } from './ProblemDetails';

export default class VerifierError extends Error {
  public stepCode: string;
  public problemDetails?: ProblemDetails;

  constructor (stepCode: string, message: string, problemDetailsType?: ProblemDetailsType | string) {
    super(message);
    this.stepCode = stepCode;
    if (problemDetailsType) {
      this.problemDetails = {
        type: problemDetailsType,
        detail: message
      };
    }
  }
}
