import { Certificate, STEPS, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';
import { substepsList } from '../../../src/constants/verificationSubSteps';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given it is called with a Blockcerts v3', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: '2b065c69c70432e9f082629939733afd2343e83f45939519986e9a09cf8ccd08',
            issuingAddress: '0x7e30a37763e6ba1ffede1750bbefb4c60b17a1b3',
            time: '2020-03-11T14:48:23.000Z',
            revokedAddresses: []
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3Alpha);
          await certificate.init();
        });

        afterEach(function () {
          certificate = null;
          sinon.restore();
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.getTransactionId,
            label: substepsList.getTransactionId.labelPending,
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

      describe('when the certificate has been tampered with', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: 'a16e3677d1f0ddae82642b6995937d3082fdef3323431cf6d0ada4acb893f4cc',
            issuingAddress: '0x7e30a37763e6ba1ffede1750bbefb4c60b17a1b3',
            time: '2020-02-04T13:52:09.000Z',
            revokedAddresses: []
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3AlphaTampered);
          await certificate.init();
        });

        afterEach(function () {
          sinon.restore();
          certificate = null;
        });

        it('should return the error finalStep', async function () {
          const errorMessage = domain.i18n.getText('errors', 'ensureHashesEqual');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.FAILURE,
            message: errorMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });

    describe('given it is called with a Blockcerts v3 with custom contexts', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: '2c7afa4f8192bd8d0e243da2044306b2183527270ef6fd76854c34a1288756ba',
            issuingAddress: 'n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4',
            time: '2021-05-06T14:35:09.000Z',
            revokedAddresses: ['n2h5AGW1xtnSFeXNr6SCSwXty6kP42Pri4']
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3AlphaCustomContext);
          await certificate.init();
        });

        afterEach(function () {
          sinon.restore();
          certificate = null;
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.getTransactionId,
            label: substepsList.getTransactionId.labelPending,
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
    });
  });
});
