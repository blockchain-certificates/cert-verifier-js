# cert-verifier-js

A library to enable parsing and verifying a Blockcert. This can be used as a node package or in a browser. The browserified script is available as `verifier.js`.

## Running tests

```
npm run test
```

## Node.js samples

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

## Using in a browser

`npm install` generates the browserified script `verifier.js`. 

The following shows how you can use it: 

```
<script src="./verifier.js"></script>

const certificateContentsString = ...
const certJson = JSON.parse(certificateContentsString);
const cert = Verifier.Certificate.parseJson(certJson);
```

See [cert-web-component](https://github.com/blockchain-certificates/cert-web-component) for an example.
