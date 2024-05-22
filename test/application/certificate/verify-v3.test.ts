import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Certificate, STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import BlockcertsV3 from '../../fixtures/v3/testnet-v3-did.json';
import BlockcertsV3Tampered from '../../fixtures/v3/testnet-v3--tampered.json';
import BlockcertsV3CustomContext from '../../fixtures/v3/testnet-v3-custom-context.json';
import domain from '../../../src/domain';
import { getText } from '../../../src/domain/i18n/useCases';
import { SUB_STEPS } from '../../../src/domain/verifier/entities/verificationSteps';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../assertions/v3.0-issuer-profile.json';
import v3RevocationList from '../../assertions/v3-revocation-list';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    let requestStub;
    let lookForTxStub;
    let certificate;

    beforeEach(function () {
      lookForTxStub = sinon.stub(ExplorerLookup, 'lookForTx');
      requestStub = sinon.stub(ExplorerLookup, 'request');

      requestStub.withArgs({
        url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
      }).resolves(JSON.stringify({ didDocument }));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
      }).resolves(JSON.stringify(fixtureIssuerProfile));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
      }).resolves(JSON.stringify(v3RevocationList));
    });

    afterEach(function () {
      certificate = null;
      sinon.restore();
    });

    describe('given it is called with a Blockcerts v3', function () {
      describe('when the certificate is valid', function () {
        beforeEach(async function () {
          lookForTxStub.resolves({
            remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-04-05T18:45:30.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(BlockcertsV3);
          await certificate.init();
        });

        it('should call the verification callback with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.checkExpiresDate,
            label: getText('subSteps', `${SUB_STEPS.checkExpiresDate}LabelPending`),
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
          lookForTxStub.resolves({
            remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-04-05T18:45:30.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(BlockcertsV3Tampered);
          await certificate.init();
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
          lookForTxStub.resolves({
            remoteHash: '731225437616acfe1d4d3d671a27afefc15576c7d9911dab4acaf63f8fa09e8d',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-03-24T21:50:16.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(BlockcertsV3CustomContext);
          await certificate.init();
        });

        it('should call the callback function with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.checkExpiresDate,
            label: getText('subSteps', `${SUB_STEPS.checkExpiresDate}LabelPending`),
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
