export default class VerifierError extends Error {
  public stepCode: string;

  constructor (stepCode: string, message: string) {
    super(message);
    this.stepCode = stepCode;
  }
}
