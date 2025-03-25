import { describe } from 'vitest';
// import { Certificate, VERIFICATION_STATUSES } from '../../../src';
// import MocknetVCV2ValidFromValid from '../../fixtures/v3/mocknet-vc-v2-validFrom-valid.json';
// import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

// function getIssuerProfileResponse (): string {
//   const issuerProfile = {
//     ...fixtureBlockcertsIssuerProfile
//   };
//
//   delete issuerProfile.proof; // we are not testing this part and since we had the `expires` field, it would fail
//
//   const targetVerificationMethod = issuerProfile.verificationMethod
//     .find(vm => vm.id === MocknetVCV2ValidFromValid.proof.verificationMethod);
//
//   targetVerificationMethod.expires = '2023-04-05T18:45:30Z';
//
//   return JSON.stringify(issuerProfile);
// }

// TODO: we need to create a fixture file signed by a VM referenced in the blockcerts Issuer Profile
describe.todo('given the certificate is signed by an expired EcdsaSecp256k12019 verification method', function () {
  // this test will expire in 2039
  // it('should fail verification', async function () {
  //   vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
  //     const explorerLookup = await importOriginal();
  //     return {
  //       ...explorerLookup,
  //       request: async function ({ url }) {
  //         if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
  //           return getIssuerProfileResponse();
  //         }
  //       }
  //     };
  //   });
  //
  //   const certificate = new Certificate(MocknetVCV2ValidFromValid);
  //   await certificate.init();
  //   const result = await certificate.verify();
  //   expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  //   expect(result.message).toBe('The verification key has expired');
  //   vi.restoreAllMocks();
  // });
});
