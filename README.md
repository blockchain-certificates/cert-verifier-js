# @blockcerts/cert-verifier-js-v1-legacy

[![Build Status](https://travis-ci.com/blockchain-certificates/cert-verifier-js-v1-legacy.svg?branch=master)](https://travis-ci.com/blockchain-certificates/cert-verifier-js-v1-legacy)
[![codecov](https://codecov.io/gh/blockchain-certificates/cert-verifier-js-v1-legacy/branch/master/graph/badge.svg)](https://codecov.io/gh/blockchain-certificates/cert-verifier-js-v1-legacy)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A library to parse and verify [Blockcerts](https://www.blockcerts.org/) v1 legacy certificates.

### [The library to parse and verify Blockcerts v2 & v3 is here](https://github.com/blockchain-certificates/cert-verifier-js)

# Usage

## Install

```shell
$ npm i @blockcerts/cert-verifier-js-v1-legacy
```

## Import

### From version 4
Instantiation of the certificate now becomes asynchronous.
While you would import the `Certificate` constructor and instantiate identically (see below), consumers now need to call the async function `init`. 

Example:
```javascript
import { Certificate } from '@blockcerts/cert-verifier-js-v1-legacy';
let certificate = new Certificate(certificateDefinition);
await certificate.init();
```  


#### Commonjs
Exposed by default:

```javascript
const { Certificate } = require('@blockcerts/cert-verifier-js-v1-legacy');
var certificate = new Certificate(certificateDefinition);
```

### Running in Nodejs
```javascript
const { Certificate } = require('@blockcerts/cert-verifier-js-v1-legacy/lib');
var certificate = new Certificate(certificateDefinition);
```

#### ES module
```javascript
import { Certificate } from '@blockcerts/cert-verifier-js-v1-legacy';
let certificate = new Certificate(certificateDefinition);
```

#### Script tag (iife)
[Check an example here](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/test/e2e/script-tag.html)
```html
<script src='node_modules/@blockcerts/cert-verifier-js-v1-legacy/dist/verifier-iife.js'></script>
<script>
  var certificate = new Verifier.Certificate(certificateDefinition);
</script>
```

## Examples

You can find more examples in the [test folder](./test/e2e/).

In the [manual testing folder](./test/manual-testing/) you will find examples of implementation both in nodejs and browser environments. 

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
    - locale: (`String`): language code used to set the language used by the verifier. Default: `en-US`. If set to `auto` it will use the user's browser language if available, or default to `en-US`. See the [dedicated section](#i18n) for more information.
    - explorerAPIs: (`[Object]`): As of v4.1.0 it is possible to provide a custom service API for the transaction explorer. This enables customers to select a potentially more reliable/private explorer to retrieve the blockchain transaction bound to a Blockcert. See the [dedicated section](#explorerAPIs) for more information.  

#### Returns
The certificate instance has the following properties:
- `certificateImage`: `String`. Raw data of the certificate image
- `certificateJson`: `Object`. Certificate JSON object
- `chain`: `Object`. Chain the certificate was issued on
- `description`: `String`. Description of the certificate
- `expires`: `String|null`. Expiration date
- `id`: `String`. Certificate's ID
- `isFormatValid`: `Boolean`. Indicates whether or not the certificate has a valid format
- `issuedOn`: `String`. Datetime of issuance (ISO-8601)
- `issuer`: `Object`. Certificate issuer
- `locale`: `String`. Language code used by the verifier
- `metadataJson`: `Object|null `. Certificate metadata object
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
import { BLOCKCHAINS, STEPS, SUB_STEPS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '@blockcerts/cert-verifier-js-v1-legacy';
```
- [`BLOCKCHAINS`](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/src/constants/blockchains.js): descriptive object of all blockchains supported by the library
- [`STEPS`](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/src/constants/verificationSteps.js): descriptive object of all verification steps (top level)
- [`SUB_STEPS`](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/src/constants/verificationSubSteps.js): descriptive object of all verification substeps
- [`CERTIFICATE_VERSIONS`](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/src/constants/certificateVersions.js): list of all certificate versions
- [`VERIFICATION_STATUSES`](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/src/constants/verificationStatuses.js)

### i18n
The exposed function `getSupportedLanguages()` returns an array of language codes supported by the library.
```javascript
import { getSupportedLanguages } from '@blockcerts/cert-verifier-js-v1-legacy';
getSupportedLanguages(); // ['en-US', 'es-ES', 'mt', ...]
```
You can use the codes for the `locale` option.

Please note that while we are working to add new languages, any new translation is welcome through forking & PR.

## explorerAPIs
As of v4.1.0, customers of this library have the ability to provide a set of blockchain explorers that will be used to retrieve the transaction data used for storing a Blockerts on a blockchain, through the `explorerAPIs` option key.

NOTE: With the addition of Typescript to this library, some types are now exposed for consumers.

The property is set as part of the `options` parameter of the `Certificate` constructor, as follows:

```javascript
const certificate = new Certificate(definition, options);
```

The expected shape of the object is as follows:
```javascript
  key?: string;
  keyPropertyName?: string;
  serviceName?: TRANSACTION_APIS; 
  serviceURL: string | ExplorerURLs;
  priority: 0 | 1 | -1; // 0 means the custom API will be ran before the public APIs listed, 1 after, -1 is reserved for default explorers
  parsingFunction: TExplorerParsingFunction;
```

More information on each item:
- `serviceName`: when a consumer wants to overwrite some information of the default explorer APIs provided (for instance provide their own keys to the service API), they should match the name of that API service with this property.
- `key`: the explorer service API key value.
- `keyPropertyName`: the expected parameter name to hold the key value. Depends on each service. (ie: Etherscan: "apiKey", Blockcypher: "token", etc). Required when a key is passed. 
- `serviceURL`: when set to `string` will be assumed to be set for the `mainnet` of the Blockchain.
When set to an object, the customer will be able to provide a service url for the `mainnet` and for the `testnet` versions of the blockchain.
The object is then shaped as such:
```javascript
{
  main: 'url',
  test: 'url'
}
```

- `priority`: this option allows the customer to decide if they wish to see their custom explorers to be executed before/after the default ones provided by the library (see the constants/api file for a list of default explorers). If the option is set to `0`, custom explorers will be called first. If set to `1` they   will be called after the default ones. `-1` value is reserved for default explorers.

- `parsingFunction (response: Object, chain?: SupportedChains, key?: string, keyPropertyName?: string)`: this function is required to parse the data (server response) as returned from the API, into the `TransactionData` shape that will be used by the library.
Arguments:
  - `response`: the response object as returned by the explorer service that was called.
  - `chain`: (optional) the blockchain which to lookup. Mostly used to identify if it is a test chain or a main chain.
  - `key`: (optional) when further calls need to be made to the same API, the API key is injected again to the parsing function for convenience.
  - `keyPropertyName`: (optional) when further calls need to be made to the same API, the API key is injected again to the parsing function for reference.
The expected output shape is as follows:

```
interface TransactionData {
  remoteHash: string;
  issuingAddress: string;
  time: string | Date;
  revokedAddresses: string[];
}
```

The consumer needs to write their own function for each service used.

## Revocation
The `assertionId` is appended to the `revocationList` URL request as query parameter, to allow the filtering of the
 `revokedAssertions` by the provider: `{revocationList}?assertionId={assertionIdValue}` 
 More details here [in this ticket](https://github.com/blockchain-certificates/cert-verifier-js/issues/715).

## Contribute

### Run the tests
```shell
$ npm run test
```

### Manual testing
You can test the build output (`npm run build`) in the browser and/or in nodejs to ensure you get satisfactory results with low overhead.

#### Browser
To test the browser build simply run `npm run test:manual:browser`. This will open an HTML page if your default browser which will test the fixtures for each version.

NOTE V1: At the time of writing this, it is expected that the v1 certificate will fail on retrieving the issuer profile due to a mixed content block from your browser.
To circumvent the issue you can either modify the v1 certificate to set the issuer profile to HTTPS. This means tempring with the certificate and will yield a hash mismatch error.
You may also change the settings of your browser to disable the Mixed Content Block filter. The certificate still does not validate since it's been revoked.
We are looking for a working v1 example.

NOTE V3: The certificate does not validate as it's been revoked. This does still prove the code works.

#### Nodejs
To test the node build you will first need to start the server:
     `npm run test:manual:node:server`
     
Then in a separate console window run:
    `npm run test:manual:node:verify`
    
NOTE V1: v1 validation does not go through as the issuer profile retrieval is denied. We are looking for a working v1 example.
NOTE V3: The certificate does not validate as it's been revoked. This does still prove the code works.

### Build
```shell
$ npm run build
```
The build files are in the `dist` folder.

## Verification process
If you want more details about the verification process, please check out the [documentation](https://github.com/blockchain-certificates/cert-verifier-js-v1-legacy/blob/master/docs/verification-process.md).

# Contact

Contact us at [the Blockcerts community forum](http://community.blockcerts.org/).
