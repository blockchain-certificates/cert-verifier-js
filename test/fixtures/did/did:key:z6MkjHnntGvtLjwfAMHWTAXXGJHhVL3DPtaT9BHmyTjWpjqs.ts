export default {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1',
    'https://w3id.org/security/suites/x25519-2020/v1'
  ],
  id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
  verificationMethod: [
    {
      id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      type: 'Ed25519VerificationKey2020',
      controller: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      publicKeyMultibase: 'z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
    }
  ],
  authentication: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  assertionMethod: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  capabilityDelegation: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  capabilityInvocation: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  keyAgreement: [
    {
      id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6LSryEyvxgv9paaRHFeJ3vbHvPhtETwh339P52eDT21xdb1',
      type: 'X25519KeyAgreementKey2020',
      controller: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      publicKeyMultibase: 'z6LSryEyvxgv9paaRHFeJ3vbHvPhtETwh339P52eDT21xdb1'
    }
  ]
};
