import sinon from 'sinon';
import { VERIFICATION_STATUSES } from '../../../src';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import Verifier from '../../../src/verifier';
import domain from '../../../src/domain';
import { deepCopy } from '../../../src/helpers/object';
import { SUB_STEPS } from '../../../src/constants/verificationSteps';
import verificationStepsV1Mainnet from '../../assertions/verification-steps-v1-mainnet';
import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import type { IVerificationMapItem } from '../../../src/models/VerificationMap';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import fixtureV1 from '../../fixtures/v1/mainnet-valid-1.2.json';
import fixtureV1IssuerProfile from '../../fixtures/v1/got-issuer_live.json';

describe('Verifier entity test suite', function () {
  let verifierInstance: Verifier;
  const verifierParamFixture = {
    certificateJson: fixtureV1,
    chain: BLOCKCHAINS.bitcoin,
    expires: '',
    id: fixtureV1.document.assertion.id,
    issuer: fixtureV1.document.certificate.issuer,
    revocationKey: null,
    explorerAPIs: undefined,
    proof: {
      type: 'ChainpointSHA256v2'
    }
  };

  beforeEach(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
    }).resolves(JSON.stringify(fixtureV1IssuerProfile));
  });

  afterEach(function () {
    verifierInstance = null;
    sinon.restore();
  });

  describe('constructor method', function () {
    beforeEach(async function () {
      verifierInstance = new Verifier(verifierParamFixture);
      await verifierInstance.init();
    });

    describe('given all parameters are passed', function () {
      it('should set the expires to the verifier object', function () {
        expect(verifierInstance.expires).toBe(verifierParamFixture.expires);
      });

      it('should set the id to the verifier object', function () {
        expect(verifierInstance.id).toBe(verifierParamFixture.id);
      });

      it('should set the issuer to the verifier object', function () {
        expect(verifierInstance.issuer).toEqual(verifierParamFixture.issuer);
      });

      it('should set the revocationKey to the verifier object', function () {
        expect(verifierInstance.revocationKey).toBe(verifierParamFixture.revocationKey);
      });

      describe('explorerAPIs', function () {
        describe('given the verifier is called with a custom explorerAPI', function () {
          it('should pass the property to the lookForTx function', async function () {
            const fixtureExplorerAPI: ExplorerAPI = {
              serviceURL: 'https://test.com'
            };
            const parametersWithExporerAPI = {
              ...verifierParamFixture,
              explorerAPIs: [
                fixtureExplorerAPI
              ]
            };

            const lookForTxSpy: sinon.SinonStub = sinon.stub(domain.verifier, 'lookForTx');
            const instance = new Verifier(parametersWithExporerAPI);
            await instance.init();
            await instance.verify();
            expect(lookForTxSpy.firstCall.args[0].explorerAPIs).toEqual(parametersWithExporerAPI.explorerAPIs);
            lookForTxSpy.restore();
          });
        });
      });

      describe('verify method', function () {
        describe('when starting a new verification process', function () {
          it('should reset the step status property', async function () {
            sinon.stub(domain.verifier, 'lookForTx').resolves({
              remoteHash: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
              issuingAddress: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619',
              time: '2016-10-03T19:52:55.000Z',
              revokedAddresses: []
            });
            const instance = new Verifier(verifierParamFixture);
            await instance.init();
            await instance.verify();
            // @ts-expect-error accessing private field
            expect((instance._stepsStatuses)).not.toEqual([]);
            // ignore await
            void instance.verify();
            // @ts-expect-error accessing private field
            expect(instance._stepsStatuses).toEqual([]);
          });
        });
      });

      it('should set the documentToVerify to the verifier object', function () {
        const documentAssertion = JSON.parse(JSON.stringify(fixtureV1));
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });

      it('should set the verificationSteps property', function () {
        const expectedSteps = deepCopy<IVerificationMapItem[]>(verificationStepsV1Mainnet);
        expect(verifierInstance.verificationSteps).toEqual(expectedSteps);
      });
    });
  });

  describe('isFailing method', function () {
    beforeEach(async function () {
      verifierInstance = new Verifier(verifierParamFixture);
      await verifierInstance.init();
    });

    describe('when all checks are successful', function () {
      it('should return false', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2' });

        expect((verifierInstance as any)._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2' });

        expect((verifierInstance as any)._isFailing()).toBe(true);
      });
    });
  });

  describe('verificationProcess property', function () {
    describe('when the process is for a mainnet v1', function () {
      it('should be set accordingly', async function () {
        verifierInstance = new Verifier(verifierParamFixture);
        await verifierInstance.init();
        const expectedOutput = [
          SUB_STEPS.checkRevokedStatus,
          SUB_STEPS.checkExpiresDate
        ];
        expect(verifierInstance.verificationProcess).toEqual(expectedOutput);
      });
    });
  });
});
