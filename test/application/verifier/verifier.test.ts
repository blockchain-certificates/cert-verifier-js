import sinon from 'sinon';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import fixture from '../../fixtures/v2/mainnet-valid-2.0.json';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '../../../src';
import Verifier from '../../../src/verifier';
import domain from '../../../src/domain';
import mainnetMapAssertion from '../domain/certificates/useCases/assertions/mainnetMapAssertion';
import { deepCopy } from '../../../src/helpers/object';
import type { IVerificationMapItem } from '../../../src/domain/certificates/useCases/getVerificationMap';
import FIXTURES from '../../fixtures';
import issuerProfileAssertion from '../../assertions/v3.0-alpha-issuer-profile.json';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import { SUB_STEPS, VerificationSteps } from '../../../src/constants/verificationSteps';

describe('Verifier entity test suite', function () {
  let verifierInstance: Verifier;
  const verifierParamFixture = {
    certificateJson: fixture,
    chain: BLOCKCHAINS.bitcoin,
    expires: '',
    id: fixture.id,
    issuer: fixture.badge.issuer,
    receipt: fixture.signature,
    revocationKey: null,
    transactionId: fixture.signature.anchors[0].sourceId,
    version: CERTIFICATE_VERSIONS.V2_0,
    explorerAPIs: undefined,
    verificationSteps: mainnetMapAssertion,
    hashlinkVerifier: new HashlinkVerifier()
  };

  afterEach(function () {
    verifierInstance = null;
  });

  describe('constructor method', function () {
    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('given all parameters are passed', function () {
      it('should set the chain to the verifier object', function () {
        expect(verifierInstance.chain).toEqual(verifierParamFixture.chain);
      });

      it('should set the expires to the verifier object', function () {
        expect(verifierInstance.expires).toBe(verifierParamFixture.expires);
      });

      it('should set the id to the verifier object', function () {
        expect(verifierInstance.id).toBe(verifierParamFixture.id);
      });

      it('should set the issuer to the verifier object', function () {
        expect(verifierInstance.issuer).toEqual(verifierParamFixture.issuer);
      });

      it('should set the receipt to the verifier object', function () {
        expect(verifierInstance.receipt).toBe(verifierParamFixture.receipt);
      });

      it('should set the revocationKey to the verifier object', function () {
        expect(verifierInstance.revocationKey).toBe(verifierParamFixture.revocationKey);
      });

      it('should set the version to the verifier object', function () {
        expect(verifierInstance.version).toBe(verifierParamFixture.version);
      });

      it('should set the transactionId to the verifier object', function () {
        expect(verifierInstance.transactionId).toBe(verifierParamFixture.transactionId);
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
            await instance.verify();
            expect(lookForTxSpy.firstCall.args[0].explorerAPIs).toEqual(parametersWithExporerAPI.explorerAPIs);
            lookForTxSpy.restore();
          });
        });
      });

      describe('verify method', function () {
        describe('when starting a new verification process', function () {
          it('should reset the step status property', async function () {
            const instance = new Verifier(verifierParamFixture);
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
        const documentAssertion = JSON.parse(JSON.stringify(fixture));
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });

      it('should set the verificationSteps property', function () {
        const expectedSteps = deepCopy<IVerificationMapItem[]>(mainnetMapAssertion);
        expect(verifierInstance.verificationSteps).toEqual(expectedSteps);
      });

      describe('when the issuer profile URN is a DID', function () {
        it('should add the issuer identity verification to the verification steps', async function () {
          const fixture = JSON.parse(JSON.stringify(verifierParamFixture));
          fixture.certificateJson = FIXTURES.BlockcertsV3;
          fixture.issuer = {
            ...issuerProfileAssertion,
            didDocument
          };
          const verifierInstance = new Verifier(fixture);
          const expectedStepIndex = verifierInstance.verificationSteps
            .findIndex(parentStep => parentStep.code === VerificationSteps.identityVerification);
          expect(expectedStepIndex).toBe(2);
        });
      });
    });
  });

  describe('isFailing method', function () {
    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('when all checks are successful', function () {
      it('should return false', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(true);
      });
    });
  });

  describe('groomVerificationProcess method', function () {
    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('given it is provided with the verificationStep object', function () {
      it('should extract the sub steps', function () {
        const expectedOutput = [
          SUB_STEPS.getIssuerProfile,
          SUB_STEPS.parseIssuerKeys,
          SUB_STEPS.checkImagesIntegrity,
          SUB_STEPS.getTransactionId,
          SUB_STEPS.computeLocalHash,
          SUB_STEPS.fetchRemoteHash,
          SUB_STEPS.compareHashes,
          SUB_STEPS.checkMerkleRoot,
          SUB_STEPS.checkReceipt,
          SUB_STEPS.checkRevokedStatus,
          SUB_STEPS.checkAuthenticity,
          SUB_STEPS.checkExpiresDate
        ];
        const output = verifierInstance.groomVerificationProcess(mainnetMapAssertion);
        expect(output).toEqual(expectedOutput);
      });
    });
  });
});
