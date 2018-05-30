'use strict';

import bitcoin from 'bitcoinjs-lib';
import jsonld from 'jsonld';

import debug from 'debug';
import {Blockchain, CertificateVersion, CheckForUnmappedFields, Contexts, VerifierError} from '../config/default';
import sha256 from 'sha256';
import { dateToUnixTimestamp } from './utils';

const log = debug("checks");

require('string.prototype.startswith');

const {obi: OBI_CONTEXT, blockcerts: BLOCKCERTS_CONTEXT, blockcertsv1_2: BLOCKCERTSV1_2_CONTEXT, blockcertsv2: BLOCKCERTSV2_CONTEXT} = Contexts;
const CONTEXTS = {};
// Preload contexts
CONTEXTS["https://w3id.org/blockcerts/schema/2.0-alpha/context.json"] = BLOCKCERTS_CONTEXT;
CONTEXTS["https://www.blockcerts.org/schema/2.0-alpha/context.json"] = BLOCKCERTS_CONTEXT;
CONTEXTS["https://w3id.org/openbadges/v2"] = OBI_CONTEXT;
CONTEXTS["https://openbadgespec.org/v2/context.json"] = OBI_CONTEXT;
CONTEXTS["https://w3id.org/blockcerts/v2"] = BLOCKCERTSV2_CONTEXT;
CONTEXTS["https://www.w3id.org/blockcerts/schema/2.0/context.json"] = BLOCKCERTSV2_CONTEXT;
CONTEXTS["https://w3id.org/blockcerts/v1"] = BLOCKCERTSV1_2_CONTEXT;


export function ensureNotRevokedBySpentOutput(revokedAddresses, issuerRevocationKey, recipientRevocationKey) {
  if (issuerRevocationKey) {
    const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((address) => address === issuerRevocationKey));
    if (isRevokedByIssuer) {
      throw new VerifierError("This certificate batch has been revoked by the issuer.");
    }
  }
  if (recipientRevocationKey) {
    const isRevokedByRecipient = (-1 != revokedAddresses.findIndex((address) => address === recipientRevocationKey));
    if (isRevokedByRecipient) {
      throw new VerifierError("This recipient's certificate has been revoked.");
    }
  }
}

export function ensureNotRevokedByList(revokedAssertions, assertionUid) {
  if (!revokedAssertions) {
    // nothing to do
    return;
  }
  const revokedAddresses = revokedAssertions.map((output) => output.id);
  const isRevokedByIssuer = (-1 != revokedAddresses.findIndex((id) => id === assertionUid));
  if (isRevokedByIssuer) {
    throw new VerifierError("This certificate has been revoked by the issuer.");
  }
}

export function ensureIssuerSignature(issuerKey, certificateUid, certificateSignature, chain) {
  let bitcoinChain = chain === Blockchain.bitcoin ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  if (!bitcoin.message.verify(issuerKey, certificateSignature, certificateUid, bitcoinChain)) {
    throw new VerifierError("Issuer key doesn't match derived address.");
  }
}

export function ensureHashesEqual(actual, expected) {
  if (actual !== expected) {
    throw new VerifierError("Computed hash does not match remote hash");
  }
}

export function ensureMerkleRootEqual(merkleRoot, remoteHash) {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError("Merkle root does not match remote hash.");
  }
}

export function ensureValidIssuingKey(keyMap, txIssuingAddress, txTime) {
  var validKey = false;
  var theKey = getCaseInsensitiveKey(keyMap, txIssuingAddress);
  txTime = dateToUnixTimestamp(txTime);
  if (theKey) {
    validKey = true;
    if (theKey.created) {
      validKey &= txTime >= theKey.created;
    }
    if (theKey.revoked) {
      validKey &= txTime <= theKey.revoked;
    }
    if (theKey.expires) {
      validKey &= txTime <= theKey.expires;
    }
  }
  if (!validKey) {
    throw new VerifierError("Transaction occurred at time when issuing address was not considered valid.");
  }
};

export function ensureValidReceipt(receipt) {
  var proofHash = receipt.targetHash;
  var merkleRoot = receipt.merkleRoot;
  try {
    var proof = receipt.proof;
    if (!!proof) {
      for (var index in proof) {
        const node = proof[index];
        if (typeof node.left !== "undefined") {
          var appendedBuffer = _toByteArray(`${node.left}${proofHash}`);
          proofHash = sha256(appendedBuffer);
        } else if (typeof node.right !== "undefined") {
          var appendedBuffer = _toByteArray(`${proofHash}${node.right}`);
          proofHash = sha256(appendedBuffer);
        } else {
          throw new VerifierError("We should never get here.");
        }
      }
    }
  } catch (e) {
    throw new VerifierError("The receipt is malformed. There was a problem navigating the merkle tree in the receipt.");
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError("Invalid Merkle Receipt. Proof hash didn't match Merkle root");
  }
};

export function computeLocalHashV1_1(certificateString) {
  // When getting the file over HTTP, we've seen an extra newline be appended. This removes that.
  var correctedData = certificateString.slice(0, -1);
  return sha256(correctedData);
};

export function computeLocalHash(document, version) {
  var expandContext = document["@context"];
  var theDocument = document;
  if (version === CertificateVersion.v2_0 && CheckForUnmappedFields) {
    if (expandContext.find(x => x === Object(x) && "@vocab" in x)) {
      expandContext = null;
    } else {
      expandContext.push({"@vocab": "http://fallback.org/"});
    }
  }
  var nodeDocumentLoader = jsonld.documentLoaders.node();
  var customLoader = function (url, callback) {
    if (url in CONTEXTS) {
      return callback(
          null, {
            contextUrl: null,
            document: CONTEXTS[url],
            documentUrl: url
          });
    }
    return nodeDocumentLoader(url, callback);
  };
  jsonld.documentLoader = customLoader;
  var normalizeArgs =
      {
          algorithm: 'URDNA2015',
          format: 'application/nquads'
      };
  if (expandContext) {
      normalizeArgs.expandContext = expandContext;
  }

  return new Promise((resolve, reject) => {
    jsonld.normalize(theDocument, normalizeArgs, (err, normalized) => {
      if (!!err) {
        reject(new VerifierError(err, "Failed JSON-LD normalization"));
      } else {
        let unmappedFields = getUnmappedFields(normalized);
        if (unmappedFields) {
          reject(new VerifierError("Found unmapped fields during JSON-LD normalization: " + unmappedFields.join(",")));
        } else {
          resolve(sha256(_toUTF8Data(normalized)));
        }
      }
    });
  });
};

function getUnmappedFields(normalized) {
  var myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
  var matches = myRegexp.exec(normalized);
  if (matches) {
    var unmappedFields = Array();
    for (var i = 0; i < matches.length; i++) {
      unmappedFields.push(matches[i]);
    }
    return unmappedFields;
  }
  return null;
};

export function ensureNotExpired(expires) {
  if (!expires) {
    return;
  }
  var expiryDate = dateToUnixTimestamp(expires);
  if (new Date() >= expiryDate) {
    throw new VerifierError("This certificate has expired.");
  }
  // otherwise, it's fine
}

function _toByteArray(hexString) {
  var outArray = [];
  var byteSize = 2;
  for (var i = 0; i < hexString.length; i += byteSize) {
    outArray.push(parseInt(hexString.substring(i, i + byteSize), 16));
  }
  return outArray;
};

function _toUTF8Data(string) {
  var utf8 = [];
  for (var i = 0; i < string.length; i++) {
    var charcode = string.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6),
          0x80 | (charcode & 0x3f));
    }
    else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10)
          | (string.charCodeAt(i) & 0x3ff));
      utf8.push(0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f));
    }
  }
  return utf8;
};

function _hexFromByteArray(byteArray) {
  var out = "";
  for (var i = 0; i < byteArray.length; ++i) {
    var value = byteArray[i];
    if (value < 16) {
      out += "0" + value.toString(16)
    } else {
      out += value.toString(16)
    }
  }
  return out;
};

function getCaseInsensitiveKey(obj, value) {
  var key = null;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (prop.toLowerCase() === value.toLowerCase()) {
        key = prop;
      }
    }
  }
  return obj[key];
}
