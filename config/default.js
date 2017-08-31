// var fs = require('fs');

module.exports = {
    CertificateVersion: {
        v1_1: "1.1",
        v1_2: "1.2",
        v2_0: "2.0"
    },

    SecurityContextUrl: "https://w3id.org/security/v1",

    Url: {
        blockCypherUrl: "https://api.blockcypher.com/v1/btc/main/txs/",
        blockCypherTestUrl: "https://api.blockcypher.com/v1/btc/test3/txs/",
        blockrIoUrl: "https://btc.blockr.io/api/v1/tx/info/",
        blockrIoTestUrl: "https://tbtc.blockr.io/api/v1/tx/info/",
    },

    Status: {
        computingLocalHash: "computingLocalHash",
        fetchingRemoteHash: "fetchingRemoteHash",
        comparingHashes: "comparingHashes",
        checkingMerkleRoot: "checkingMerkleRoot",
        checkingReceipt: "checkingReceipt",
        checkingIssuerSignature: "checkingIssuerSignature",
        checkingAuthenticity: "checkingAuthenticity",
        checkingRevokedStatus: "checkingRevokedStatus",
        checkingExpiresDate: "checkingExpiresDate",
        success: "success",
        failure: "failure"
    },

    PublicKey: "ecdsa-koblitz-pubkey:1",

    //TODO Fixes or read direct in files??
    Contexts: {
        obi: {
            "@context": {
                "id": "@id",
                "type": "@type",

                "extensions": "https://w3id.org/openbadges/extensions#",
                "obi": "https://w3id.org/openbadges#",
                "validation": "obi:validation",

                "cred": "https://w3id.org/credentials#",
                "dc": "http://purl.org/dc/terms/",
                "schema": "http://schema.org/",
                "sec": "https://w3id.org/security#",
                "xsd": "http://www.w3.org/2001/XMLSchema#",

                "AlignmentObject": "schema:AlignmentObject",
                "CryptographicKey": "sec:Key",
                "Endorsement": "cred:Credential",

                "Assertion": "obi:Assertion",
                "BadgeClass": "obi:BadgeClass",
                "Criteria": "obi:Criteria",
                "Evidence": "obi:Evidence",
                "Extension": "obi:Extension",
                "FrameValidation": "obi:FrameValidation",
                "IdentityObject": "obi:IdentityObject",
                "Image": "obi:Image",
                "HostedBadge": "obi:HostedBadge",
                "hosted": "obi:HostedBadge",
                "Issuer": "obi:Issuer",
                "Profile": "obi:Profile",
                "RevocationList": "obi:RevocationList",
                "SignedBadge": "obi:SignedBadge",
                "signed": "obi:SignedBadge",
                "TypeValidation": "obi:TypeValidation",
                "VerificationObject": "obi:VerificationObject",

                "author": { "@id": "schema:author", "@type": "@id" },
                "caption": { "@id": "schema:caption" },
                "claim": { "@id": "cred:claim", "@type": "@id" },
                "created": { "@id": "dc:created", "@type": "xsd:dateTime" },
                "creator": { "@id": "dc:creator", "@type": "@id" },
                "description": { "@id": "schema:description" },
                "email": { "@id": "schema:email" },
                "endorsement": { "@id": "cred:credential", "@type": "@id" },
                "expires": { "@id": "sec:expiration", "@type": "xsd:dateTime" },
                "genre": { "@id": "schema:genre" },
                "image": { "@id": "schema:image", "@type": "@id" },
                "name": { "@id": "schema:name" },
                "owner": { "@id": "sec:owner", "@type": "@id" },
                "publicKey": { "@id": "sec:publicKey", "@type": "@id" },
                "publicKeyPem": { "@id": "sec:publicKeyPem" },
                "related": { "@id": "dc:relation", "@type": "@id" },
                "startsWith": { "@id": "http://purl.org/dqm-vocabulary/v1/dqm#startsWith" },
                "tags": { "@id": "schema:keywords" },
                "targetDescription": { "@id": "schema:targetDescription" },
                "targetFramework": { "@id": "schema:targetFramework" },
                "targetName": { "@id": "schema:targetName" },
                "targetUrl": { "@id": "schema:targetUrl" },
                "telephone": { "@id": "schema:telephone" },
                "url": { "@id": "schema:url", "@type": "@id" },
                "version": { "@id": "schema:version" },

                "alignment": { "@id": "obi:alignment", "@type": "@id" },
                "allowedOrigins": { "@id": "obi:allowedOrigins" },
                "audience": { "@id": "obi:audience" },
                "badge": { "@id": "obi:badge", "@type": "@id" },
                "criteria": { "@id": "obi:criteria", "@type": "@id" },
                "endorsementComment": { "@id": "obi:endorsementComment" },
                "evidence": { "@id": "obi:evidence", "@type": "@id" },
                "hashed": { "@id": "obi:hashed", "@type": "xsd:boolean" },
                "identity": { "@id": "obi:identityHash" },
                "issuedOn": { "@id": "obi:issueDate", "@type": "xsd:dateTime" },
                "issuer": { "@id": "obi:issuer", "@type": "@id" },
                "narrative": { "@id": "obi:narrative" },
                "recipient": { "@id": "obi:recipient", "@type": "@id" },
                "revocationList": { "@id": "obi:revocationList", "@type": "@id" },
                "revocationReason": { "@id": "obi:revocationReason" },
                "revoked": { "@id": "obi:revoked", "@type": "xsd:boolean" },
                "revokedAssertions": { "@id": "obi:revoked" },
                "salt": { "@id": "obi:salt" },
                "targetCode": { "@id": "obi:targetCode" },
                "uid": { "@id": "obi:uid" },
                "validatesType": "obi:validatesType",
                "validationFrame": "obi:validationFrame",
                "validationSchema": "obi:validationSchema",
                "verification": { "@id": "obi:verify", "@type": "@id" },
                "verificationProperty": { "@id": "obi:verificationProperty" },
                "verify": "verification"
            }
        },

        blockcerts: {
            "@context": {
                "id": "@id",
                "type": "@type",
                "bc": "https://w3id.org/blockcerts#",
                "obi": "https://w3id.org/openbadges#",
                "cp": "https://w3id.org/chainpoint#",
                "schema": "http://schema.org/",
                "sec": "https://w3id.org/security#",
                "xsd": "http://www.w3.org/2001/XMLSchema#",

                "MerkleProof2017": "sec:MerkleProof2017",

                "RecipientProfile": "bc:RecipientProfile",
                "SignatureLine": "bc:SignatureLine",
                "MerkleProofVerification2017": "bc:MerkleProofVerification2017",

                "recipientProfile": "bc:recipientProfile",
                "signatureLines": "bc:signatureLines",
                "introductionUrl": { "@id": "bc:introductionUrl", "@type": "@id" },

                "subtitle": "bc:subtitle",

                "jobTitle": "schema:jobTitle",

                "creator": { "@id": "dc:creator", "@type": "@id" },
                "expires": {
                    "@id": "sec:expiration",
                    "@type": "xsd:dateTime"
                },
                "revoked": {
                    "@id": "sec:expiration",
                    "@type": "xsd:dateTime"
                },
                "CryptographicKey": "sec:Key",
                "signature": "sec:signature",

                "verification": "bc:verification",
                "publicKeys": "bc:publicKeys",

                "ChainpointSHA256v2": "cp:ChainpointSHA256v2",
                "BTCOpReturn": "cp:BTCOpReturn",
                "targetHash": "cp:targetHash",
                "merkleRoot": "cp:merkleRoot",
                "proof": "cp:proof",
                "anchors": "cp:anchors",
                "sourceId": "cp:sourceId",
                "right": "cp:right",
                "left": "cp:left"
            },
            "obi:validation": [
                {
                    "obi:validatesType": "RecipientProfile",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0-alpha/recipientSchema.json"
                },
                {
                    "obi:validatesType": "SignatureLine",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0-alpha/signatureLineSchema.json"
                },
                {
                    "obi:validatesType": "MerkleProof2017",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0-alpha/merkleProof2017Schema.json"
                }
            ]
        },

        blockcertsv2: {
            "@context": {
                "id": "@id",
                "type": "@type",
                "bc": "https://w3id.org/blockcerts#",
                "obi": "https://w3id.org/openbadges#",
                "cp": "https://w3id.org/chainpoint#",
                "schema": "http://schema.org/",
                "sec": "https://w3id.org/security#",
                "xsd": "http://www.w3.org/2001/XMLSchema#",

                "MerkleProof2017": "sec:MerkleProof2017",

                "RecipientProfile": "bc:RecipientProfile",
                "SignatureLine": "bc:SignatureLine",
                "MerkleProofVerification2017": "bc:MerkleProofVerification2017",

                "recipientProfile": "bc:recipientProfile",
                "signatureLines": "bc:signatureLines",
                "introductionUrl": { "@id": "bc:introductionUrl", "@type": "@id" },

                "subtitle": "bc:subtitle",

                "jobTitle": "schema:jobTitle",

                "expires": {
                    "@id": "sec:expiration",
                    "@type": "xsd:dateTime"
                },
                "revoked": {
                    "@id": "obi:revoked",
                    "@type": "xsd:boolean"
                },
                "CryptographicKey": "sec:Key",
                "signature": "sec:signature",
                "verification": {
                    "@id": "obi:verify",
                    "@type": "@id"
                },
                "publicKey": {
                    "@id": "sec:publicKey",
                    "@type": "@id"
                },

                "ChainpointSHA256v2": "cp:ChainpointSHA256v2",
                "BTCOpReturn": "cp:BTCOpReturn",
                "targetHash": "cp:targetHash",
                "merkleRoot": "cp:merkleRoot",
                "proof": "cp:proof",
                "anchors": "cp:anchors",
                "sourceId": "cp:sourceId",
                "right": "cp:right",
                "left": "cp:left"
            },
            "obi:validation": [
                {
                    "obi:validatesType": "RecipientProfile",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0/recipientSchema.json"
                },
                {
                    "obi:validatesType": "SignatureLine",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0/signatureLineSchema.json"
                },
                {
                    "obi:validatesType": "MerkleProof2017",
                    "obi:validationSchema": "https://w3id.org/blockcerts/schema/2.0/merkleProof2017Schema.json"
                }
            ]
        },
    },

} 