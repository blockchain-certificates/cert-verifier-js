import fixture from '../../fixtures/v2/mainnet-valid-2.0.json';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '../../../src';
import Verifier from '../../../src/verifier';

describe('Verifier entity test suite', function () {
  const verifierParamFixture = {
    certificateJson: fixture,
    chain: BLOCKCHAINS.bitcoin,
    expires: '',
    id: fixture.id,
    issuer: fixture.badge.issuer,
    receipt: fixture.signature,
    revocationKey: null,
    transactionId: fixture.signature.anchors[0].sourceId,
    version: CERTIFICATE_VERSIONS.V2_0
  };

  describe('constructor method', function () {
    describe('given all parameters are passed', function () {
      const verifierInstance = new Verifier(verifierParamFixture);

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

      it('should set the documentToVerify to the verifier object', function () {
        const documentAssertion = JSON.parse(JSON.stringify(fixture));
        delete documentAssertion.signature;
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });
    });
  });

  describe('isFailing method', function () {
    let verifierInstance;
    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('when all checks are successful', function () {
      it('should return false', function () {
        verifierInstance._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        verifierInstance._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        verifierInstance._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        verifierInstance._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(true);
      });
    });
  });
});
