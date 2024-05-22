import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Certificate, STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import domain from '../../../src/domain';
import { SUB_STEPS, VerificationSteps } from '../../../src/domain/verifier/entities/verificationSteps';
import { getText } from '../../../src/domain/i18n/useCases';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import v2RevocationList from '../../assertions/v2-revocation-list';
import v2IssuerProfile from '../../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import MainnetV2Valid from '../../fixtures/v2/mainnet-valid-2.0.json';
import MainnetV2Revoked from '../../fixtures/v2/mainnet-revoked-2.0.json';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    let requestStub;
    let lookForTxStub;
    let certificate;

    beforeEach(function () {
      lookForTxStub = sinon.stub(domain.verifier, 'lookForTx');
      requestStub = sinon.stub(ExplorerLookup, 'request');

      requestStub.withArgs({
        url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
      }).resolves(JSON.stringify(v2IssuerProfile));
      requestStub.withArgs({
        url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39'
      }).resolves(JSON.stringify(v2RevocationList));
    });

    afterEach(function () {
      certificate = null;
      sinon.restore();
    });

    describe('given the callback parameter is passed', function () {
      describe('when the certificate is valid', function () {
        beforeEach(async function () {
          lookForTxStub.resolves({
            remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
            issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
            time: '2018-02-08T00:23:34.000Z',
            revokedAddresses: [
              '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
            ]
          });
          certificate = new Certificate(MainnetV2Valid);
          await certificate.init();
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: getText('subSteps', `${SUB_STEPS.checkRevokedStatus}LabelPending`),
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
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
          lookForTxStub.resolves({
            remoteHash: '4f877ca8cf3029c248e53cc93b6929ca28af2f11092785efcbc99127c9695d9d',
            issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
            time: '2020-09-02T16:39:43.000Z',
            revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo']
          });
          certificate = new Certificate(MainnetV2Revoked);
          await certificate.init();
        });

        it('should call it with the step, the text, the status & the error message', async function () {
          const updates = [];
          const assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: getText('subSteps', `${SUB_STEPS.checkRevokedStatus}LabelPending`),
            parentStep: VerificationSteps.statusCheck,
            status: VERIFICATION_STATUSES.FAILURE,
            errorMessage: 'This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.'
          };

          await certificate.verify(update => {
            updates.push(update);
          });

          // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
          const comparisonStep = updates.find(update => update.code === SUB_STEPS.checkRevokedStatus && update.status === VERIFICATION_STATUSES.FAILURE);
          expect(comparisonStep).toEqual(assertionStep);
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
