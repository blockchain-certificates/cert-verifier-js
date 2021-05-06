const fetch = require('node-fetch');
const fixtures = require('../fixtures/fixtures');

function prettyFormat (jsonObject) {
  return JSON.stringify(jsonObject, null, 2);
}

async function verify (blockcerts, version) {
  if (!blockcerts) {
    throw new Error(`No blockcerts to verify. version: ${version}`);
  }

  console.log('Now starting verification of', version, blockcerts.id);

  const verificationStatus = await fetch('http://localhost:4000/verification', {
    body: JSON.stringify({
      blockcerts,
      version
    }),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => res.json());

  console.log(prettyFormat(verificationStatus));
  console.log(version, 'verification end');
}

function verifyCerts () {
  fixtures.forEach((fixture, index) => verify(fixture, `v${index + 1}`));
}

verifyCerts();
