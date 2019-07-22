# @blockcerts/cert-verifier-js

[![Build Status](https://travis-ci.com/blockchain-certificates/cert-verifier-js.svg?branch=master)](https://travis-ci.com/blockchain-certificates/cert-verifier-js)
[![codecov](https://codecov.io/gh/blockchain-certificates/cert-verifier-js/branch/master/graph/badge.svg)](https://codecov.io/gh/blockchain-certificates/cert-verifier-js)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A library to parse and verify [Blockcerts](https://www.blockcerts.org/) certificates.

# Usage

## Install

```shell
$ npm i @blockcerts/cert-verifier-js
```

## Import

#### Commonjs
Exposed by default:

```javascript
var Certificate = require('@blockcerts/cert-verifier-js');
var certificate = new Certificate(certificateDefinition);
```

#### ES module
```javascript
import { Certificate } from '@blockcerts/cert-verifier-js';
let certificate = new Certificate(certificateDefinition);
```

#### Script tag (iife)
[Check an example here](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/test/e2e/script-tag.html)
```html
<script src='node_modules/@blockcerts/cert-verifier-js/dist/verifier-iife.js'></script>
<script>
  var certificate = new Verifier.Certificate(certificateDefinition);
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
  const verificationResult = await certificate.verify(({code, label, status, errorMessage}) => {
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

### `new Certificate(certificateDefinition, options)`
```javascript
const certificate = new Certificate(certificateDefinition);
```
The constructor automatically parses a certificate.

#### Parameter
- `certificateDefinition` (`String|Object`): the certificate definition. Can either be a string or a JSON object.
- `options`: (`Object`): an object of options. The following properties are used:
    - locale: (`String`): language code used to set the language used by the verifier. Default: `en-US`.

#### Returns
The certificate instance has the following properties:
- `certificateImage`: `String`. Raw data of the certificate image
- `certificateJson`: `Object`. Certificate JSON object
- `chain`: `Object`. Chain the certificate was issued on
- `description`: `String`. Description of the certificate
- `expires`: `String`. Expiration date
- `id`: `String`. Certificate's ID
- `isFormatValid`: `Boolean`. Indicates whether or not the certificate has a valid format
- `issuedOn`: `String`. Datetime of issuance (ISO-8601)
- `issuer`: `Object`. Certificate issuer
- `locale`: `String`. Language code used by the verifier
- `metadataJson`: `Object`. Certificate metadata object
- `name`: `String`. Name of the certificate
- `publicKey`: `String`. Certificate's public key
- `receipt`: `Object`. Certificate's receipt
- `recipientFullName`: `String`. Full name of recipient
- `recordLink`: `String`. Link to the certificate record
- `revocationKey`: `String|null`. Revocation key (if any)
- `sealImage`: `String`. Raw data of the seal's image;
- `signature`: `String|null`. Certificate's signature
- `signatureImage`: [`SignatureImage[]`][signatureLineModel]. Array of certificate [signature lines][signatureLineModel].
- `subtitle`: `String|null`. Subtitle of the certificate
- `transactionId`: `String`. Transaction ID
- `rawTransactionLink`: `String`. Raw transaction ID
- `transactionLink`: `String`. Transaction link
- `verificationSteps`: `VerificationStep[]`. The array of steps the certificate will have to go through during verification
- `version`: `CertificateVersion`. [Version of the certificate](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/certificateVersions.js)

[signatureLineModel]: src/models/signatureImage.js

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
console.log(`Verification was a ${certificateVerification.status}:`, certificateVerification.message);
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
{ code, status, message }
```
- `code`: code of the final step (`final`)
- `status`: final verification status (`success`, `failure`)
- `message` string | Object: status message. It is internationalized and in case of failure it returns the error message of the failed step. When an object, it takes the following shape:
  - `label`: Main label of the final step
  - `description`: further details about the issuance
  - `linkText`: translation provided for a link text towards the transaction

Shape of the returned object can be checked here: https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/data/i18n.json#L41

### Constants
Several constants are being exposed:
```javascript
import { BLOCKCHAINS, STEPS, SUB_STEPS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '@blockcerts/cert-verifier-js';
```
- [`BLOCKCHAINS`](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/blockchains.js): descriptive object of all blockchains supported by the library
- [`STEPS`](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/verificationSteps.js): descriptive object of all verification steps (top level)
- [`SUB_STEPS`](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/verificationSubSteps.js): descriptive object of all verification substeps
- [`CERTIFICATE_VERSIONS`](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/certificateVersions.js): list of all certificate versions
- [`VERIFICATION_STATUSES`](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/src/constants/verificationStatuses.js)

### i18n
The exposed function `getSupportedLanguages()` returns an array of language codes supported by the library.
```javascript
import { getSupportedLanguages } from '@blockcerts/cert-verifier-js';
getSupportedLanguages(); // ['en-US', 'es-ES', 'mt', ...]
```
You can use the codes for the `locale` option.

Please note that while we are working to add new languages, any new translation is welcome through forking & PR.

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
If you want more details about the verification process, please check out the [documentation](https://github.com/blockchain-certificates/cert-verifier-js/blob/master/docs/verification-process.md).

# Contact

Contact us at [the Blockcerts community forum](http://community.blockcerts.org/).
