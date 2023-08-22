const http = require('node:http');
const fixtures = require('../fixtures/fixtures');

function prettyFormat (jsonObject) {
  return JSON.stringify(jsonObject, null, 2);
}

async function verify (blockcerts, version) {
  if (!blockcerts) {
    throw new Error(`No blockcerts to verify. version: ${version}`);
  }

  console.log('Now starting verification of', version, blockcerts.id);

  const req = http.request('http://localhost:4000/verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, function (res) {
    res.setEncoding('utf-8');
    res.on('data', (data) => {
      console.log(prettyFormat(JSON.parse(data)));
      console.log(version, 'verification end');
    });
  });

  req.write(JSON.stringify({
    blockcerts,
    version
  }));

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
}

function verifyCerts () {
  fixtures.forEach((fixture, index) => verify(fixture, `v${index + 2}`)); // no v1 anymore, bit dirty innit?
}

verifyCerts();
