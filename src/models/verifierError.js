export class VerifierError extends Error {
  constructor (stepCode, message) {
    super(message);
    this.stepCode = stepCode;
  }
}
