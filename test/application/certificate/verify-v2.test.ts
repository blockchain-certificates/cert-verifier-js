import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest';
import { Certificate, STEPS, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import { SUB_STEPS, VerificationSteps } from '../../../src/domain/verifier/entities/verificationSteps';
import { getText } from '../../../src/domain/i18n/useCases';
import v2RevocationList from '../../assertions/v2-revocation-list';
import v2IssuerProfile from '../../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import MainnetV2Valid from '../../fixtures/v2/mainnet-valid-2.0.json';
import MainnetV2Revoked from '../../fixtures/v2/mainnet-revoked-2.0.json';
describe('Certificate test suite', function () {
  describe('verify method', function () {
    let certificate;

    beforeAll(function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          request: async function ({ url }) {
            if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
              return JSON.stringify(v2IssuerProfile);
            }

            if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39') {
              return JSON.stringify(v2RevocationList);
            }
          },
          lookForTx: function (args) {
            if (args.transactionId === 'd298fa7a2d593e6bc208a339fce287df3560ef2d4c975e571542f79d3ca680f4') {
              return {
                remoteHash: '4f877ca8cf3029c248e53cc93b6929ca28af2f11092785efcbc99127c9695d9d',
                issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
                time: '2020-09-02T16:39:43.000Z',
                revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo']
              };
            }
            return {
              remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
              issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
              time: '2018-02-08T00:23:34.000Z',
              revokedAddresses: [
                '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
              ]
            };
          }
        };
      });
    });

    afterEach(function () {
      certificate = null;
      vi.restoreAllMocks();
    });

    describe('given the callback parameter is passed', function () {
      describe('when the certificate is valid', function () {
        beforeEach(async function () {
          certificate = new Certificate(MainnetV2Valid);
          await certificate.init();
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = vi.fn();
          const assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: getText('subSteps', `${SUB_STEPS.checkRevokedStatus}LabelPending`),
            parentStep: VerificationSteps.statusCheck,
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          const sampleExpectedStep = callbackSpy.mock.calls.flat()
            .filter(step => step.code === SUB_STEPS.checkRevokedStatus)
            .find(step => step.status === VERIFICATION_STATUSES.SUCCESS);
          expect(sampleExpectedStep).toEqual(assertionStep);
        });

        it('should return the success finalStep', async function () {
          const successMessage = domain.i18n.getText('success', 'blockchain');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS,
            message: successMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });

      describe('when the certificate is invalid', function () {
        beforeEach(async function () {
          certificate = new Certificate(MainnetV2Revoked);
          await certificate.init();
        });

        it('should call it with the step, the text, the status & the error message', async function () {
          const callbackSpy = vi.fn();
          const assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: getText('subSteps', `${SUB_STEPS.checkRevokedStatus}LabelPending`),
            parentStep: VerificationSteps.statusCheck,
            status: VERIFICATION_STATUSES.FAILURE,
            errorMessage: 'This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.'
          };

          await certificate.verify(callbackSpy);

          const sampleExpectedStep = callbackSpy.mock.calls.flat()
            .filter(step => step.code === SUB_STEPS.checkRevokedStatus)
            .find(step => step.status === VERIFICATION_STATUSES.FAILURE);

          expect(sampleExpectedStep).toEqual(assertionStep);
        });

        it('should return the failure finalStep', async function () {
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.FAILURE,
            message: 'This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.'
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });
  });
});
