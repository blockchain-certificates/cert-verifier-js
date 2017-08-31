# cert-verifier-js

A library to enable parsing and verifying a Blockcert. This can be used as a node package or in a browser. The browserified script is available as `verifier.js`.

## Sample code

### Parsing a Blockcert

```
var fs = require('fs');

fs.readFile('./tests/sample_cert-valid-1.2.0.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }

  let cert = Certificate.parseJson(JSON.parse(data));
  console.log(cert.name);

});
```

### Verifying a Blockcert

```
var fs = require('fs');

function statusCallback(arg1) {
  console.log("status=" + arg1);
}

fs.readFile('../tests/sample_cert-valid-2.0.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }
  var certVerifier = new CertificateVerifier(data, statusCallback);

  certVerifier.verify(function (err, data) {
    if (err) {
      console.log("failed");
    } else {
      console.log("done");
    }
  });

});
```

### Using in a browser

`npm run build` generates the browserified script `verifier.js`. 

The following shows how you can use it: 

```
<script src="./verifier.js"></script>

const certificateContentsString = ...
const certJson = JSON.parse(certificateContentsString);
const cert = Verifier.Certificate.parseJson(certJson);
```

See [cert-web-component](https://github.com/blockchain-certificates/cert-web-component) for an example.

In Crome DevTools to turn on debug mode:

localStorage.debug = 'verifier'

In Node.js:

DEBUG=verifier babel-node lib/verifier.js  

See [debug] (https://www.npmjs.com/package/debug) for an example.

## Verification Process

This library and the python [cert-verifier](https://github.com/blockchain-certificates/cert-verifier) library verify Blockchain Certificates. However, anyone should be able to verify independently, whether manually or by writing their own library or service. These steps walk you through the certificate verification steps.

## Inputs

### Blockchain Certificate

The Blockchain Certificate contains:
 - the content to be verified
 - the location of additional inputs needed for verification (described in next inputs)

### Blockchain Transaction

A Blockchain Certificate must have a `certificate.signature.anchors` field, which must contain at least one anchor to a blockchain transaction. 

The `anchors` entry below says that the transaction was performed on the Bitcoin blockchain, and the field needed to verify  integrity of the certificate is `OP_RETURN` (because `type` is `BTCOpReturn`). This also says the transaction id is `8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d` (via the `sourceId`) field.
 
```
"type": "BTCOpReturn",
"sourceId": "8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d"
```

Supplied with the blockchain identifier and transaction id, the transaction can be obtained from a service like [blockchain.info](http://blockchain.info/). [See important security notes in "Securely looking up a Blockchain transaction".] The general query format is: 

```
http://blockchain.info/rawtx/<transaction_id>
```

So in this example we would download [http://blockchain.info/rawtx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d](http://blockchain.info/rawtx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d)

#### Securely looking up a Blockchain transaction
For purposes of demonstrating the process, we used the blockchain.info explorer to look up a transaction. There are problems with this that should be considered for your deployment.

Using a blockchain transaction lookup service is effectively putting trust into that service, but that service could be compromised in a number of ways. A more secure approach is to run a full bitcoin node and look up the transaction directly. However, this requires machine resources that may not be feasible in all installations. At minimum, a mitigation is to check multiple services to see if they agree.

Note that this also assumes the verifier is online. We are pursuing alternative ways to resolve this and the above issue (securely looking up a transaction withput SPOFs and without prohibitive hardware resounses).

### Issuer identity

The `badge.issuer.id` field in the Blockchain Certificate says where to find the issuer's current information about which keys are valid. Currently, this is a HTTP URI (although the schema allows for other implementations), which (when dereferenced) contains an array of public keys claimed by the issuer.

```
{
  ...
  "publicKey": [
    {
      "created": "2012-01-03T14:34:57+0000",
      "revoked": "2012-05-01T18:11:19+0000",
      "@id": "ecdsa-koblitz-pubkey:16wyA4kLFiaQSEE9xZEFTEMXTzWsGf4Zki"
    },
    {
      "created": "2016-01-03T14:34:57+0000",
      "@id": "ecdsa-koblitz-pubkey:1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619"
    }
  ],
  ...
}
```

This information is required to cross check the public keys claimed by the issuer with the information from the blockchain transaction.

### Issuer revocation information

The `badge.issuer.revocationList` field in the Blockchain Certificate says where to obtain the issuer's list of revoked certificates (a.k.a. assertions). Open Badges-compliant Blockcerts use an HTTP URI, per the Open Badges specification. When dereferenced, this URI provides an array of revoked assertions. For example:

```
{
  ...
  "revokedAssertions": [
    {
      "id": "urn:uuid:93019408-acd8-4420-be5e-0400d643954a",
      "revocationReason": "Honor code violation"
    },
    {  
      "id": "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
      "revocationReason": "Issued in error."
    }
  ]
}
```

The Blockcerts schema allows other implementations of revocation, depending on the implementations allowed by the blockchain, and domain/issuer appropriateness. 

### Check certificate integrity

Checking the certificate integrity ensures that the certificate has not been tampered with. This consists of 3 steps


1\. Validate the Merkle proof in the certificate.

Blockcerts uses the Verifiable Claims MerkleProof2017 signature format, which is based on Chainpoint 2.0. Per the (pending) specification, these Merkle proofs may be verified by sending the object in the `signature` field to any Chainpoint 2.0-compatible verifier, after replacing the `MerkleProof2017` type with the Chainpoint type `ChainpointSHA256v2`.

2\. Compare the hash of the local certificate with the value in the receipt.

Blockcerts uses JSON-LD canonicalization to ensure a consistent order of the JSON input. This ensures a consistent hash for verifiers. Per the JSON-LD signature specification, this works as follows:

*    Remove the `signature` portion from the Blockchain Certificate is removed
*    JSON-LD canonicalize the result
     *   With settings: `{'algorithm': 'URDNA2015', 'format': 'application/nquads'}`
*    SHA-256 the result  

The resulting value should match the value in `signature.targetHash`

Note that Blockcerts performs an additional test during JSON-LD canonicalization to detect unmapped fields via a fallback `@vocab` entry, and detecting if any fields were unmapped.

3\. Compare the merkleRoot value in the certificate with the value in the blockchain transaction.

The transaction information in the "Blockchain Transaction" input step obtains the blockchain record of the content. This step compares the value in the transaction with the value in the certificate. 

The transaction details at https://blockchain.info/rawtx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d has entries in the `out` array. The entry with the `OP_RETURN` value has a `script` starting with `6a20`. Specifically:

```
{
    ...
    "value":0,
    "script":"6a2068f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728"
}
```

The `OP_RETURN` value in this example is `68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728`, or the value in `script` without the `6a20` prefix.

This value should match that provided in the Blockchain Certificate `signature.merkleRoot` field.

### Check certificate authenticity

This step verifies that the certificate was authored by the issuer. This is verified by ensuring the signing key for the blockchain transaction is indeed claimed by the issuer, and the key was valid at the time the transaction was issued.

This uses the timestamp and input address from the blockchain transaction details obtained in "TBD", and the issuer identification provided in "Issuer Identity". 

From blockchain transaction information, obtain the timestamp and input address. This will vary depending on which service you use. For Blockchain.info, we need the `addr` field from the `inputs` array and the `time` field. 


```
"inputs":[
  {
     "prev_out":{
        ...
        "addr":"1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619",
        ...
      }
  }
]
...
"time":1475524375,
```

This is a Unix epoch time format, and a tool like https://www.epochconverter.com/ can convert it to a human readable format. This example yields `03 Oct 2016 19:52:55 GMT`. 

This public key is valid:

- The issuer claims the public key `1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619` is valid starting `03 Jan 2016 14:34:57 GMT`
- The transaction occurred `03 Oct 2016 19:52:55 GMT`, which is after the `created` date, and the key had not expired or been revoked when the transaction occurred.

```
{
  ...
  "publicKey": [
    {
      "created": "2012-01-03T14:34:57+0000",
      "revoked": "2012-05-01T18:11:19+0000",
      "@id": "ecdsa-koblitz-pubkey:16wyA4kLFiaQSEE9xZEFTEMXTzWsGf4Zki"
    },
    {
      "created": "2016-01-03T14:34:57+0000",
      "@id": "ecdsa-koblitz-pubkey:1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619",
      "expires": "2017-01-03T14:34:57+0000",
    }
  ],
  ...
}
```

This rules out exceptional (and possibly fraudulent) cases, such as:
- the public key is not claimed by the issuer
- the transaction was issued after the public key was revoked or expires

A critical distinction in this example is that the transaction is considered valid even though the key expired. This is ok -- all that matters is that the transaction was performed when the key was active. 
 
A key expiration is different from a certificate expiration; expiring keys is a good security practice for issuers. The next step will check certificate expiration.


### Check not revoked by issuer

The input obtained from "Issuer revocation information" contains the list of revoked certificates (or "assertions"). 

For Open Badges-compliant Blockcerts, a certificate is considered revoked if any `id` entry in the `revokedAssertions` array contains the id of the certificate. The certificate id is available in the (`id`) field of the Blockchain Certificate.

If the certificate has been revoked, the (optional) `revocationReason` may provide more information about why the certificate was revoked.

### Check certificate has not expired

The certificate may contain an expiration date (an ISO-8601 date). If present, verification must compare this value, available in the `expires` field, against the current time.


## Running tests

```
npm run test
```
