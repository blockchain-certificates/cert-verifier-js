export default {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/jws-2020/v1'
  ],
  id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
  verificationMethod: [
    {
      id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'R91kQ2HOJBqr1uyCU9-ma8IySvB6upk132JBPpGBqeI'
      }
    },
    {
      id: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6LSryEyvxgv9paaRHFeJ3vbHvPhtETwh339P52eDT21xdb1',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: '4z5-dNji0nLIffzBX25JSJHYmNAFSDjXP9xyFLT4tHw'
      }
    }
  ],
  assertionMethod: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  authentication: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  capabilityInvocation: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  capabilityDelegation: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs'
  ],
  keyAgreement: [
    'did:key:z6MkjHnntGvtLjwfAMHWTAXXGJHhVL3DPtaT9BHmyTjWpjqs#z6LSryEyvxgv9paaRHFeJ3vbHvPhtETwh339P52eDT21xdb1'
  ]
};
