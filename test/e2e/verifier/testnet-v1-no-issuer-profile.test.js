import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';

describe('given the certificate\'s issuer profile no longer exists', function () {
  it('should fail', async function () {
    const certificate = new Certificate(FIXTURES.TestnetV1NoIssuerProfile);
    await certificate.init();
    let failingStep = {};
    const result = await certificate.verify(({ code, label, status, errorMessage }) => {
      if (code === SUB_STEPS.getIssuerProfile && status === VERIFICATION_STATUSES.FAILURE) {
        failingStep = { code, label, status, errorMessage };
      }
    });
    expect(failingStep).toEqual({ code: SUB_STEPS.getIssuerProfile, label: 'Getting issuer profile', status: VERIFICATION_STATUSES.FAILURE, errorMessage: 'Unable to get issuer profile' });
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });
});
