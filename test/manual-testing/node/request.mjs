import fetch from 'node-fetch';
import fixtures from '../fixtures/fixtures.mjs';

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
  fixtures.forEach((fixture, index) => verify(fixture, `v${index + 2}`)); // no v1 anymore, bit dirty innit?
}

verifyCerts();
