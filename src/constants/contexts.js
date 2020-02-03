export default {
  obi: {
    '@context': {
      'id': '@id',
      'type': '@type',

      'extensions': 'https://w3id.org/openbadges/extensions#',
      'obi': 'https://w3id.org/openbadges#',
      'validation': 'obi:validation',

      'cred': 'https://w3id.org/credentials#',
      'dc': 'http://purl.org/dc/terms/',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'AlignmentObject': 'schema:AlignmentObject',
      'CryptographicKey': 'sec:Key',
      'Endorsement': 'cred:Credential',

      'Assertion': 'obi:Assertion',
      'BadgeClass': 'obi:BadgeClass',
      'Criteria': 'obi:Criteria',
      'Evidence': 'obi:Evidence',
      'Extension': 'obi:Extension',
      'FrameValidation': 'obi:FrameValidation',
      'IdentityObject': 'obi:IdentityObject',
      'Image': 'obi:Image',
      'HostedBadge': 'obi:HostedBadge',
      'hosted': 'obi:HostedBadge',
      'Issuer': 'obi:Issuer',
      'Profile': 'obi:Profile',
      'RevocationList': 'obi:RevocationList',
      'SignedBadge': 'obi:SignedBadge',
      'signed': 'obi:SignedBadge',
      'TypeValidation': 'obi:TypeValidation',
      'VerificationObject': 'obi:VerificationObject',

      'author': { '@id': 'schema:author', '@type': '@id' },
      'caption': { '@id': 'schema:caption' },
      'claim': { '@id': 'cred:claim', '@type': '@id' },
      'created': { '@id': 'dc:created', '@type': 'xsd:dateTime' },
      'creator': { '@id': 'dc:creator', '@type': '@id' },
      'description': { '@id': 'schema:description' },
      'email': { '@id': 'schema:email' },
      'endorsement': { '@id': 'cred:credential', '@type': '@id' },
      'expires': { '@id': 'sec:expiration', '@type': 'xsd:dateTime' },
      'genre': { '@id': 'schema:genre' },
      'image': { '@id': 'schema:image', '@type': '@id' },
      'name': { '@id': 'schema:name' },
      'owner': { '@id': 'sec:owner', '@type': '@id' },
      'publicKey': { '@id': 'sec:publicKey', '@type': '@id' },
      'publicKeyPem': { '@id': 'sec:publicKeyPem' },
      'related': { '@id': 'dc:relation', '@type': '@id' },
      'startsWith': { '@id': 'http://purl.org/dqm-vocabulary/v1/dqm#startsWith' },
      'tags': { '@id': 'schema:keywords' },
      'targetDescription': { '@id': 'schema:targetDescription' },
      'targetFramework': { '@id': 'schema:targetFramework' },
      'targetName': { '@id': 'schema:targetName' },
      'targetUrl': { '@id': 'schema:targetUrl' },
      'telephone': { '@id': 'schema:telephone' },
      'url': { '@id': 'schema:url', '@type': '@id' },
      'version': { '@id': 'schema:version' },

      'alignment': { '@id': 'obi:alignment', '@type': '@id' },
      'allowedOrigins': { '@id': 'obi:allowedOrigins' },
      'audience': { '@id': 'obi:audience' },
      'badge': { '@id': 'obi:badge', '@type': '@id' },
      'criteria': { '@id': 'obi:criteria', '@type': '@id' },
      'endorsementComment': { '@id': 'obi:endorsementComment' },
      'evidence': { '@id': 'obi:evidence', '@type': '@id' },
      'hashed': { '@id': 'obi:hashed', '@type': 'xsd:boolean' },
      'identity': { '@id': 'obi:identityHash' },
      'issuedOn': { '@id': 'obi:issueDate', '@type': 'xsd:dateTime' },
      'issuer': { '@id': 'obi:issuer', '@type': '@id' },
      'narrative': { '@id': 'obi:narrative' },
      'recipient': { '@id': 'obi:recipient', '@type': '@id' },
      'revocationList': { '@id': 'obi:revocationList', '@type': '@id' },
      'revocationReason': { '@id': 'obi:revocationReason' },
      'revoked': { '@id': 'obi:revoked', '@type': 'xsd:boolean' },
      'revokedAssertions': { '@id': 'obi:revoked' },
      'salt': { '@id': 'obi:salt' },
      'targetCode': { '@id': 'obi:targetCode' },
      'uid': { '@id': 'obi:uid' },
      'validatesType': 'obi:validatesType',
      'validationFrame': 'obi:validationFrame',
      'validationSchema': 'obi:validationSchema',
      'verification': { '@id': 'obi:verify', '@type': '@id' },
      'verificationProperty': { '@id': 'obi:verificationProperty' },
      'verify': 'verification'
    }
  },
  blockcerts: {
    '@context': {
      'id': '@id',
      'type': '@type',
      'bc': 'https://w3id.org/blockcerts#',
      'obi': 'https://w3id.org/openbadges#',
      'cp': 'https://w3id.org/chainpoint#',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'MerkleProof2017': 'sec:MerkleProof2017',

      'RecipientProfile': 'bc:RecipientProfile',
      'SignatureLine': 'bc:SignatureLine',
      'MerkleProofVerification2017': 'bc:MerkleProofVerification2017',

      'recipientProfile': 'bc:recipientProfile',
      'signatureLines': 'bc:signatureLines',
      'introductionUrl': { '@id': 'bc:introductionUrl', '@type': '@id' },

      'subtitle': 'bc:subtitle',

      'jobTitle': 'schema:jobTitle',

      'creator': { '@id': 'dc:creator', '@type': '@id' },
      'expires': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'revoked': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'CryptographicKey': 'sec:Key',
      'signature': 'sec:signature',

      'verification': 'bc:verification',
      'publicKeys': 'bc:publicKeys',

      'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
      'BTCOpReturn': 'cp:BTCOpReturn',
      'targetHash': 'cp:targetHash',
      'merkleRoot': 'cp:merkleRoot',
      'proof': 'cp:proof',
      'anchors': 'cp:anchors',
      'sourceId': 'cp:sourceId',
      'right': 'cp:right',
      'left': 'cp:left'
    },
    'obi:validation': [
      {
        'obi:validatesType': 'RecipientProfile',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/recipientSchema.json'
      },
      {
        'obi:validatesType': 'SignatureLine',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/signatureLineSchema.json'
      },
      {
        'obi:validatesType': 'MerkleProof2017',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/merkleProof2017Schema.json'
      }
    ]
  },
  blockcertsv1_2:
    {
      '@context': [
        {
          'id': '@id',
          'type': '@type',
          'bc': 'https://w3id.org/blockcerts#',
          'obi': 'https://w3id.org/openbadges#',
          'cp': 'https://w3id.org/chainpoint#',
          'extensions': 'https://w3id.org/openbadges/extensions#',
          'validation': 'obi:validation',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'schema': 'http://schema.org/',
          'sec': 'https://w3id.org/security#',
          'Assertion': 'bc:Assertion',
          'Certificate': 'bc:Certificate',
          'Issuer': 'bc:Issuer',
          'BlockchainCertificate': 'bc:BlockchainCertificate',
          'CertificateDocument': 'bc:CertificateDocument',
          'issuer': {
            '@id': 'bc:issuer',
            '@type': '@id'
          },
          'blockchaincertificate': {
            '@id': 'bc:blockchaincertificate',
            '@type': '@id'
          },
          'certificate': {
            '@id': 'bc:certificate',
            '@type': '@id'
          },
          'document': {
            '@id': 'bc:document',
            '@type': '@id'
          },
          'assertion': {
            '@id': 'bc:assertion',
            '@type': '@id'
          },
          'verify': {
            '@id': 'bc:verify',
            '@type': '@id'
          },
          'recipient': {
            '@id': 'bc:recipient',
            '@type': '@id'
          },
          'receipt': {
            '@id': 'bc:receipt',
            '@type': '@id'
          },
          'publicKey': {
            '@id': 'bc:publicKey'
          },
          'revocationKey': {
            '@id': 'bc:revocationKey'
          },
          'image:signature': {
            '@id': 'bc:image:signature'
          },
          'signature': {
            '@id': 'bc:signature'
          },
          'familyName': {
            '@id': 'schema:familyName'
          },
          'givenName': {
            '@id': 'schema:givenName'
          },
          'jobTitle': {
            '@id': 'schema:jobTitle'
          },
          'signer': {
            '@id': 'bc:signer',
            '@type': '@id'
          },
          'attribute-signed': {
            '@id': 'bc:attribute-signed'
          },
          'ECDSA(secp256k1)': 'bc:SignedBadge',
          'subtitle': {
            '@id': 'bc:subtitle'
          },
          'email': 'schema:email',
          'hashed': {
            '@id': 'obi:hashed',
            '@type': 'xsd:boolean'
          },
          'image': {
            '@id': 'schema:image',
            '@type': '@id'
          },
          'salt': {
            '@id': 'obi:salt'
          },
          'identity': {
            '@id': 'obi:identityHash'
          },
          'issuedOn': {
            '@id': 'obi:issueDate',
            '@type': 'xsd:dateTime'
          },
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime'
          },
          'evidence': {
            '@id': 'obi:evidence',
            '@type': '@id'
          },
          'criteria': {
            '@id': 'obi:criteria',
            '@type': '@id'
          },
          'tags': {
            '@id': 'schema:keywords'
          },
          'alignment': {
            '@id': 'obi:alignment',
            '@type': '@id'
          },
          'revocationList': {
            '@id': 'obi:revocationList',
            '@type': '@id'
          },
          'name': {
            '@id': 'schema:name'
          },
          'description': {
            '@id': 'schema:description'
          },
          'url': {
            '@id': 'schema:url',
            '@type': '@id'
          },
          'uid': {
            '@id': 'obi:uid'
          },
          'TypeValidation': 'obi:TypeValidation',
          'FrameValidation': 'obi:FrameValidation',
          'validatesType': 'obi:validatesType',
          'validationSchema': 'obi:validationSchema',
          'validationFrame': 'obi:validationFrame',
          'ChainpointSHA224v2': 'cp:ChainpointSHA224v2',
          'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
          'ChainpointSHA384v2': 'cp:ChainpointSHA384v2',
          'ChainpointSHA512v2': 'cp:ChainpointSHA512v2',
          'ChainpointSHA3-224v2': 'cp:ChainpointSHA3-224v2',
          'ChainpointSHA3-256v2': 'cp:ChainpointSHA3-256v2',
          'ChainpointSHA3-384v2': 'cp:ChainpointSHA3-384v2',
          'ChainpointSHA3-512v2': 'cp:ChainpointSHA3-512v2',
          'BTCOpReturn': 'cp:BTCOpReturn',
          'targetHash': 'cp:targetHash',
          'merkleRoot': 'cp:merkleRoot',
          'proof': 'cp:proof',
          'anchors': 'cp:anchors',
          'sourceId': 'cp:sourceId',
          'right': 'cp:right',
          'left': 'cp:left'
        }
      ],
      'validation': [
        {
          'type': 'TypeValidation',
          'validatesType': 'Assertion',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/assertion-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'Certificate',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/certificate-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'Issuer',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/issuer-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'CertificateDocument',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/certificate-document-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'BlockchainCertificate',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/blockchain-certificate-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'BlockchainReceipt',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/blockchain-receipt-1.2.json'
        }
      ]
    },
  blockcertsv2: {
    '@context': {
      'id': '@id',
      'type': '@type',
      'bc': 'https://w3id.org/blockcerts#',
      'obi': 'https://w3id.org/openbadges#',
      'cp': 'https://w3id.org/chainpoint#',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'MerkleProof2017': 'sec:MerkleProof2017',

      'RecipientProfile': 'bc:RecipientProfile',
      'SignatureLine': 'bc:SignatureLine',
      'MerkleProofVerification2017': 'bc:MerkleProofVerification2017',

      'recipientProfile': 'bc:recipientProfile',
      'signatureLines': 'bc:signatureLines',
      'introductionUrl': { '@id': 'bc:introductionUrl', '@type': '@id' },

      'subtitle': 'bc:subtitle',

      'jobTitle': 'schema:jobTitle',

      'expires': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'revoked': {
        '@id': 'obi:revoked',
        '@type': 'xsd:boolean'
      },
      'CryptographicKey': 'sec:Key',
      'signature': 'sec:signature',
      'verification': {
        '@id': 'obi:verify',
        '@type': '@id'
      },
      'publicKey': {
        '@id': 'sec:publicKey',
        '@type': '@id'
      },

      'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
      'BTCOpReturn': 'cp:BTCOpReturn',
      'targetHash': 'cp:targetHash',
      'merkleRoot': 'cp:merkleRoot',
      'proof': 'cp:proof',
      'anchors': 'cp:anchors',
      'sourceId': 'cp:sourceId',
      'right': 'cp:right',
      'left': 'cp:left'
    },
    'obi:validation': [
      {
        'obi:validatesType': 'RecipientProfile',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/recipientSchema.json'
      },
      {
        'obi:validatesType': 'SignatureLine',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/signatureLineSchema.json'
      },
      {
        'obi:validatesType': 'MerkleProof2017',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/merkleProof2017Schema.json'
      }
    ]
  },
  blockcertsV3: {
    "@context": {
      "id": "@id",
      "type": "@type",
      "bc": "https://w3id.org/blockcerts#",
      "cp": "https://w3id.org/chainpoint#",
      "schema": "http://schema.org/",
      "sec": "https://w3id.org/security#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",

      "MerkleProof2019": "sec:MerkleProof2019",

      "introductionUrl": { "@id": "bc:introductionUrl", "@type": "@id" },

      "CryptographicKey": "sec:Key",

      "BTCOpReturn": "cp:BTCOpReturn",
      "targetHash": "cp:targetHash",
      "merkleRoot": "cp:merkleRoot",
      "proofOfWork": "cp:proof",
      "anchors": "cp:anchors",
      "sourceId": "cp:sourceId",
      "right": "cp:right",
      "left": "cp:left",

      "created": "sec:created",
      "creator": "sec:creator",
      "domain": "sec:domain",
      "nonce": "sec:nonce",
      "proofValue": "sec:proofValue",
      "proofPurpose": "sec:proofPurpose",
      "verificationMethod": "sec:verificationMethod",

      "name": {
        "@id": "schema:name"
      }
    }
  },
  vc: {
    "@context": {
      "@version": 1.1,

      "id": "@id",
      "type": "@type",

      "VerifiableCredential": {
        "@id": "https://www.w3.org/2018/credentials#VerifiableCredential",
        "@context": {
          "@version": 1.1,

          "id": "@id",
          "type": "@type",

          "cred": "https://www.w3.org/2018/credentials#",
          "sec": "https://w3id.org/security#",
          "xsd": "http://www.w3.org/2001/XMLSchema#",

          "credentialSchema": {
            "@id": "cred:credentialSchema",
            "@type": "@id",
            "@context": {
              "@version": 1.1,

              "id": "@id",
              "type": "@type",

              "cred": "https://www.w3.org/2018/credentials#",

              "JsonSchemaValidator2018": "cred:JsonSchemaValidator2018"
            }
          },
          "credentialStatus": {"@id": "cred:credentialStatus", "@type": "@id"},
          "credentialSubject": {"@id": "cred:credentialSubject", "@type": "@id"},
          "evidence": {"@id": "cred:evidence", "@type": "@id"},
          "expirationDate": {"@id": "cred:expirationDate", "@type": "xsd:dateTime"},
          "holder": {"@id": "cred:holder", "@type": "@id"},
          "issued": {"@id": "cred:issued", "@type": "xsd:dateTime"},
          "issuer": {"@id": "cred:issuer", "@type": "@id"},
          "issuanceDate": {"@id": "cred:issuanceDate", "@type": "xsd:dateTime"},
          "proof": {"@id": "sec:proof", "@type": "@id", "@container": "@graph"},
          "refreshService": {
            "@id": "cred:refreshService",
            "@type": "@id",
            "@context": {
              "@version": 1.1,

              "id": "@id",
              "type": "@type",

              "cred": "https://www.w3.org/2018/credentials#",

              "ManualRefreshService2018": "cred:ManualRefreshService2018"
            }
          },
          "termsOfUse": {"@id": "cred:termsOfUse", "@type": "@id"},
          "validFrom": {"@id": "cred:validFrom", "@type": "xsd:dateTime"},
          "validUntil": {"@id": "cred:validUntil", "@type": "xsd:dateTime"}
        }
      },

      "VerifiablePresentation": {
        "@id": "https://www.w3.org/2018/credentials#VerifiablePresentation",
        "@context": {
          "@version": 1.1,

          "id": "@id",
          "type": "@type",

          "cred": "https://www.w3.org/2018/credentials#",
          "sec": "https://w3id.org/security#",

          "holder": {"@id": "cred:holder", "@type": "@id"},
          "proof": {"@id": "sec:proof", "@type": "@id", "@container": "@graph"},
          "verifiableCredential": {"@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph"}
        }
      },

      "EcdsaSecp256k1Signature2019": {
        "@id": "https://w3id.org/security#EcdsaSecp256k1Signature2019",
        "@context": {
          "@version": 1.1,

          "id": "@id",
          "type": "@type",

          "sec": "https://w3id.org/security#",
          "xsd": "http://www.w3.org/2001/XMLSchema#",

          "challenge": "sec:challenge",
          "created": {"@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime"},
          "domain": "sec:domain",
          "expires": {"@id": "sec:expiration", "@type": "xsd:dateTime"},
          "jws": "sec:jws",
          "nonce": "sec:nonce",
          "proofPurpose": {
            "@id": "sec:proofPurpose",
            "@type": "@vocab",
            "@context": {
              "@version": 1.1,

              "id": "@id",
              "type": "@type",

              "sec": "https://w3id.org/security#",

              "assertionMethod": {"@id": "sec:assertionMethod", "@type": "@id", "@container": "@set"},
              "authentication": {"@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set"}
            }
          },
          "proofValue": "sec:proofValue",
          "verificationMethod": {"@id": "sec:verificationMethod", "@type": "@id"}
        }
      },

      "EcdsaSecp256r1Signature2019": {
        "@id": "https://w3id.org/security#EcdsaSecp256r1Signature2019",
        "@context": {
          "@version": 1.1,


          "id": "@id",
          "type": "@type",

          "sec": "https://w3id.org/security#",
          "xsd": "http://www.w3.org/2001/XMLSchema#",

          "challenge": "sec:challenge",
          "created": {"@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime"},
          "domain": "sec:domain",
          "expires": {"@id": "sec:expiration", "@type": "xsd:dateTime"},
          "jws": "sec:jws",
          "nonce": "sec:nonce",
          "proofPurpose": {
            "@id": "sec:proofPurpose",
            "@type": "@vocab",
            "@context": {
              "@version": 1.1,


              "id": "@id",
              "type": "@type",

              "sec": "https://w3id.org/security#",

              "assertionMethod": {"@id": "sec:assertionMethod", "@type": "@id", "@container": "@set"},
              "authentication": {"@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set"}
            }
          },
          "proofValue": "sec:proofValue",
          "verificationMethod": {"@id": "sec:verificationMethod", "@type": "@id"}
        }
      },

      "Ed25519Signature2018": {
        "@id": "https://w3id.org/security#Ed25519Signature2018",
        "@context": {
          "@version": 1.1,


          "id": "@id",
          "type": "@type",

          "sec": "https://w3id.org/security#",
          "xsd": "http://www.w3.org/2001/XMLSchema#",

          "challenge": "sec:challenge",
          "created": {"@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime"},
          "domain": "sec:domain",
          "expires": {"@id": "sec:expiration", "@type": "xsd:dateTime"},
          "jws": "sec:jws",
          "nonce": "sec:nonce",
          "proofPurpose": {
            "@id": "sec:proofPurpose",
            "@type": "@vocab",
            "@context": {
              "@version": 1.1,


              "id": "@id",
              "type": "@type",

              "sec": "https://w3id.org/security#",

              "assertionMethod": {"@id": "sec:assertionMethod", "@type": "@id", "@container": "@set"},
              "authentication": {"@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set"}
            }
          },
          "proofValue": "sec:proofValue",
          "verificationMethod": {"@id": "sec:verificationMethod", "@type": "@id"}
        }
      },

      "RsaSignature2018": {
        "@id": "https://w3id.org/security#RsaSignature2018",
        "@context": {
          "@version": 1.1,


          "challenge": "sec:challenge",
          "created": {"@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime"},
          "domain": "sec:domain",
          "expires": {"@id": "sec:expiration", "@type": "xsd:dateTime"},
          "jws": "sec:jws",
          "nonce": "sec:nonce",
          "proofPurpose": {
            "@id": "sec:proofPurpose",
            "@type": "@vocab",
            "@context": {
              "@version": 1.1,


              "id": "@id",
              "type": "@type",

              "sec": "https://w3id.org/security#",

              "assertionMethod": {"@id": "sec:assertionMethod", "@type": "@id", "@container": "@set"},
              "authentication": {"@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set"}
            }
          },
          "proofValue": "sec:proofValue",
          "verificationMethod": {"@id": "sec:verificationMethod", "@type": "@id"}
        }
      },

      "proof": {"@id": "https://w3id.org/security#proof", "@type": "@id", "@container": "@graph"}
    }
  },
  vc_exp: {
    "@context": [{
      "@version": 1.1
    },"https://www.w3.org/ns/odrl.jsonld", {
      "ex": "https://example.org/examples#",
      "schema": "http://schema.org/",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",

      "3rdPartyCorrelation": "ex:3rdPartyCorrelation",
      "AllVerifiers": "ex:AllVerifiers",
      "Archival": "ex:Archival",
      "BachelorDegree": "ex:BachelorDegree",
      "Child": "ex:Child",
      "CLCredentialDefinition2019": "ex:CLCredentialDefinition2019",
      "CLSignature2019": "ex:CLSignature2019",
      "IssuerPolicy": "ex:IssuerPolicy",
      "HolderPolicy": "ex:HolderPolicy",
      "Mother": "ex:Mother",
      "RelationshipCredential": "ex:RelationshipCredential",
      "UniversityDegreeCredential": "ex:UniversityDegreeCredential",
      "ZkpExampleSchema2018": "ex:ZkpExampleSchema2018",

      "issuerData": "ex:issuerData",
      "attributes": "ex:attributes",
      "signature": "ex:signature",
      "signatureCorrectnessProof": "ex:signatureCorrectnessProof",
      "primaryProof": "ex:primaryProof",
      "nonRevocationProof": "ex:nonRevocationProof",

      "alumniOf": {"@id": "schema:alumniOf", "@type": "rdf:HTML"},
      "child": {"@id": "ex:child", "@type": "@id"},
      "degree": "ex:degree",
      "degreeType": "ex:degreeType",
      "degreeSchool": "ex:degreeSchool",
      "college": "ex:college",
      "name": {"@id": "schema:name", "@type": "rdf:HTML"},
      "givenName": "schema:givenName",
      "familyName": "schema:familyName",
      "parent": {"@id": "ex:parent", "@type": "@id"},
      "referenceId": "ex:referenceId",
      "documentPresence": "ex:documentPresence",
      "evidenceDocument": "ex:evidenceDocument",
      "spouse": "schema:spouse",
      "subjectPresence": "ex:subjectPresence",
      "verifier": {"@id": "ex:verifier", "@type": "@id"}
    }]
  }
};
