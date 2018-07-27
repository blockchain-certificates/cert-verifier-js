# cert-verifier-js

A library to enable parsing and verifying a Blockcert. This can be used as a node package or in a browser. The browserified script is available as `verifier.js`.

# Usage

## Install

```shell
$ npm i cert-verifier-js
```

## Import

#### Commonjs
Exposed by default:

```javascript
var Certificate = require('cert-verifier-js');
var certificate = new Certificate(certificateContent);
```

#### ES module
```javascript
import Certificate from 'cert-verifier-js';
let certificate = new Certificate(certificateContent);
```

#### Script tag (iife)
```html
<script src='node_modules/cert-verifier-js/dist/verifier-iife.js'></script>
<script>
  var certificate = new Certificate(certificateContent);
</script>
```

## Examples

You can find more examples in the [test folder](./test/e2e/).

### Parse a Blockcert certificate

```javascript
var fs = require('fs');

fs.readFile('./certificate.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }

  let certificate = new Certificate(data);
  console.log(cert.name);
});
```

### Verify a Blockcert certificate

```javascript
var fs = require('fs');

fs.readFile('./certificate.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }

  let certificate = new Certificate(data);
  const verificationResult = await certificate.verify((code, label, status, errorMessage) => {
    console.log('Code:', code, label, ' - Status:', status);
    if (errorMessage) {
      console.log(`The step ${code} fails with the error: ${errorMessage}`);
    }
  });
  
  if (verificationResult.status === 'failure') {
    console.log(`The certificate is not valid. Error: ${verificationResult.errorMessage}`);
  }
});
```

# API

## `Certificate`

### `new Certificate(certificateContent)`
```javascript
const certificate = new Certificate(certificateContent);
```
The constructor automatically parses a certificate.

#### Parameter
- `certificateContent` (`String|Object`): the certificate content. Can either be a string or a JSON object.

#### Returns
The certificate instance has the following properties:
- `certificateImage`: `String`. Raw data of the certificate image
- `chain`: `Object`. Chain the certificate was issued on
- `description`: `String`. Description of the certificate
- `expires`: `String`. Expiration date
- `id`: `String`. Certificate's ID
- `isFormatValid`: `Boolean`. Indicates whether or not the certificate has a valid format
- `issuedOn`: `String`. Datetime of issuance (ISO-8601)
- `issuer`: `Object`. Certificate issuer
- `metadataJson`: `Object`. Certificate metadata object
- `name`: `String`. Name of the certificate
- `publicKey`: `String`. Certificate's public key
- `receipt`: `String`. Certificate's receipt
- `recipientFullName`: `String`. Full name of recipient
- `recordLink`: `String`. Link to the certificate record
- `revocationKey`: `String|null`. Revocation key (if any)
- `sealImage`: `String`. Raw data of the seal's image;
- `signature`: `String`. Certificate's signature
- `signatureImage`: `String`. Raw data of the certificate's signature image;
- `subtitle`: `String`. Subtitle of the certificate
- `transactionId`: `String`. Transaction ID
- `rawTransactionLink`: `String`. Raw transaction ID
- `transactionLink`: `String`. Transaction link
- `verificationSteps`: `VerificationStep[]`. The array of steps the certificate will have to go through during verification
- `version`: `CertificateVersion`. [Version of the certificate](https://github.com/blockchain-certificates/cert-verifier-js/blob/v2-wip/src/constants/certificateVersions.js)

**Note:** `verificationSteps` is generated according to the nature of the certificate. The full steps array is provided ahead of verification in order to give more flexibility to the consumer. For example, you might want to pre-render the verification steps for animation, or render a count of steps and/or sub-steps.

`VerificationStep` has the following shape:
```javascript
{
    code: 'formatValidation',
    label: 'Format validation',
    labelPending: 'Validating format',
    subSteps: [
      {
        code: 'getTransactionId',
        label: 'Get transaction ID',
        labelPending: 'Getting transaction ID',
        parentStep: 'formatValidation'
      },
      ...
    ]
}
```

### `verify(stepCallback)`
This will run the verification of a certificate. The function is asynchronous.

```javascript
const certificateVerification = await certificate.verify(({code, label, status, errorMessage}) => {
    console.log('Sub step update:', code, label, status);
}));
console.log(`Verification was a ${certificateVerification.status}:`, certificateVerification.errorMessage);
```

#### Parameters
- `({code, label, status, errorMessage}) => {}` (`Function`): callback function called whenever a substep status has changed. The callback parameter has 4 properties: 
  - `code`: substep code
  - `label`: readable label of the substep
  - `status`: substep status (`success`, `failure`, `starting`)
  - `errorMessage`: error message (optional)

#### Returns
The final verification status:
```javascript
{ status, errorMessage }
```
- `status`: final verification status (`success`, `failure`)
- `errorMessage`: error message (optional)

### Constants
Several constants are being exposed:
```javascript
import { BLOCKCHAINS, STEPS, SUB_STEPS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from 'cert-verifier-js';
```
- `BLOCKCHAINS`: descriptive object of all blockchains supported by the library
- `STEPS`: descriptive object of all verification steps (top level)
- `SUB_STEPS`: descriptive object of all verification substeps
- `CERTIFICATE_VERSIONS`: list of all certificate versions
- [`VERIFICATION_STATUSES`](https://github.com/blockchain-certificates/cert-verifier-js/blob/v2-wip/src/constants/verificationStatuses.js)

## Contribute

### Run the tests
```shell
$ npm run test
```

### Build
```shell
$ npm run build
```
The build files are in the `dist` folder.

## Verification process
If you want more details about the verification process, please check out the [documentation](./docs/verification-process.md). 

# Contact

Contact us at [the Blockcerts community forum](http://community.blockcerts.org/).
