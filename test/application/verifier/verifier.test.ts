import sinon from 'sinon';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import { VERIFICATION_STATUSES } from '../../../src';
import { BLOCKCHAINS } from '@blockcerts/explorer-lookup';
import Verifier from '../../../src/verifier';
import domain from '../../../src/domain';
import { deepCopy } from '../../../src/helpers/object';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import { SUB_STEPS, VerificationSteps } from '../../../src/domain/verifier/entities/verificationSteps';
import verificationStepsV2Mainnet from '../../assertions/verification-steps-v2-mainnet';
import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import type { IVerificationMapItem } from '../../../src/models/VerificationMap';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import fixtureMainnetIssuerProfile from '../../fixtures/issuer-profile-mainnet-example.json';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import v3RevocationList from '../../assertions/v3-revocation-list';
import fixtureV2MainnetValid from '../../fixtures/v2/mainnet-valid-2.0.json';
import fixtureBlockcertsV3 from '../../fixtures/v3/testnet-v3-did.json';

describe('Verifier entity test suite', function () {
  let verifierInstance: Verifier;
  const verifierParamFixture = {
    certificateJson: fixtureV2MainnetValid,
    chain: BLOCKCHAINS.bitcoin,
    expires: '',
    id: fixtureV2MainnetValid.id,
    issuer: fixtureV2MainnetValid.badge.issuer,
    revocationKey: null,
    explorerAPIs: undefined,
    hashlinkVerifier: new HashlinkVerifier(),
    proof: {
      type: 'MerkleProof2017'
    }
  };

  beforeEach(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
    }).resolves(JSON.stringify(v3RevocationList));
    requestStub.withArgs({
      url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
    }).resolves(JSON.stringify(fixtureMainnetIssuerProfile));
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
              remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
              issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
              time: '2018-02-08T00:23:34.000Z',
              revokedAddresses: [
                '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
              ]
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
        const documentAssertion = JSON.parse(JSON.stringify(fixtureV2MainnetValid));
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });

      it('should set the verificationSteps property', function () {
        const expectedSteps = deepCopy<IVerificationMapItem[]>(verificationStepsV2Mainnet);
        expect(verifierInstance.verificationSteps).toEqual(expectedSteps);
      });

      describe('when the issuer profile URN is a DID', function () {
        it('should add the issuer identity verification to the verification steps', async function () {
          const fixture = deepCopy<any>(verifierParamFixture);
          fixture.certificateJson = fixtureBlockcertsV3;
          fixture.issuer = {
            ...fixtureBlockcertsIssuerProfile,
            didDocument
          };
          const verifierInstance = new Verifier(fixture);
          await verifierInstance.init();
          const expectedStepIndex = verifierInstance.verificationSteps
            .findIndex(parentStep => parentStep.code === VerificationSteps.identityVerification);
          expect(expectedStepIndex).toBe(1);
        });
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
    describe('when the process is for a mainnet v2 certs with no DID and no hashlinks', function () {
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
