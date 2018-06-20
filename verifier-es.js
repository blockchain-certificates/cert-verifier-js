import 'bitcoinjs-lib';
import jsonld from 'jsonld';
import debug from 'debug';
import sha256 from 'sha256';
import 'fs';
import 'babel-polyfill';

let Status = {
  getTransactionId: 'getTransactionId',
  computingLocalHash: 'computingLocalHash',
  fetchingRemoteHash: 'fetchingRemoteHash',
  gettingIssuerProfile: 'gettingIssuerProfile',
  parsingIssuerKeys: 'parsingIssuerKeys',
  comparingHashes: 'comparingHashes',
  checkingMerkleRoot: 'checkingMerkleRoot',
  checkingReceipt: 'checkingReceipt',
  checkingIssuerSignature: 'checkingIssuerSignature',
  checkingAuthenticity: 'checkingAuthenticity',
  checkingRevokedStatus: 'checkingRevokedStatus',
  checkingExpiresDate: 'checkingExpiresDate',
  success: 'success',
  failure: 'failure',
  starting: 'starting',
  mockSuccess: 'mockSuccess',
  final: 'final'
};

const BlockchainRawTransactionIdPlaceholder = '{TRANSACTION_ID}';

var verboseMessageMap = {};
verboseMessageMap[Status.getTransactionId] = 'Getting transaction ID';
verboseMessageMap[Status.computingLocalHash] = 'Computing Local Hash';
verboseMessageMap[Status.fetchingRemoteHash] = 'Fetching remote hash';
verboseMessageMap[Status.gettingIssuerProfile] = 'Getting issuer profile';
verboseMessageMap[Status.parsingIssuerKeys] = 'Parsing issuer keys';
verboseMessageMap[Status.comparingHashes] = 'Comparing Hashes';
verboseMessageMap[Status.checkingMerkleRoot] = 'Checking Merkle Root';
verboseMessageMap[Status.checkingReceipt] = 'Checking Receipt';
verboseMessageMap[Status.checkingIssuerSignature] = 'Checking Issuer Signature';
verboseMessageMap[Status.checkingAuthenticity] = 'Checking Authenticity';
verboseMessageMap[Status.checkingRevokedStatus] = 'Checking Revoked Status';
verboseMessageMap[Status.checkingExpiresDate] = 'Checking Expires Date';
verboseMessageMap[Status.success] = 'Success';
verboseMessageMap[Status.failure] = 'Failure';
verboseMessageMap[Status.starting] = 'Starting';
verboseMessageMap[Status.mockSuccess] = 'mockSuccess';
verboseMessageMap[Status.final] = 'Final';

let getVerboseMessage = function (status) {
  return verboseMessageMap[status];
};

class VerifierError extends Error {
  constructor (stepCode, message) {
    super(message);
    this.stepCode = stepCode;
  }
}

const CertificateVersion = {
  v1_1: '1.1',
  v1_2: '1.2',
  v2_0: '2.0'
};

const Blockchain = {
  bitcoin: 'bitcoin',
  testnet: 'testnet',
  regtest: 'regtest',
  mocknet: 'mocknet',
  ethmain: 'ethmain',
  ethropst: 'ethropst',
  ethtest: 'ethtest'
};

/**
 * These are the templates of the raw transaction url
 * Use the values of Blockchain (above) as key when adding one
 */
const BlockchainRawTransactionUrl = {
  bitcoin: `https://blockchain.info/rawtx/${BlockchainRawTransactionIdPlaceholder}`,
  testnet: `https://testnet.blockchain.info/rawtx/${BlockchainRawTransactionIdPlaceholder}`,
  regtest: ``,
  mocknet: ``,
  ethmain: `https://etherscan.io/tx/${BlockchainRawTransactionIdPlaceholder}`,
  ethropst: `https://ropsten.etherscan.io/getRawTx?tx=${BlockchainRawTransactionIdPlaceholder}`,
  ethtest: ``
};

/**
 * These are the templates of the transaction url
 * Use the values of Blockchain (above) as key when adding one
 */
const BlockchainTransactionUrl = {
  bitcoin: `https://blockchain.info/tx/${BlockchainRawTransactionIdPlaceholder}`,
  testnet: `https://testnet.blockchain.info/tx/${BlockchainRawTransactionIdPlaceholder}`,
  regtest: ``,
  mocknet: ``,
  ethmain: `https://etherscan.io/tx/${BlockchainRawTransactionIdPlaceholder}`,
  ethropst: `https://ropsten.etherscan.io/tx/${BlockchainRawTransactionIdPlaceholder}`,
  ethtest: ``
};

const ChainSignatureValue = {
  /*
  These are the external display of `chain` in the signature suite. Adding a new type since `Blockchain` is
  used by the web component and so we need to remain compatible.
  */
  bitcoin: 'bitcoinMainnet',
  testnet: 'bitcoinTestnet',
  regtest: 'bitcoinRegtest',
  ethmain: 'ethereumMainnet',
  ethropst: 'ethereumRopsten',
  ethtest: 'ethereumTestnet',
  mocknet: 'mockchain'
};

const Url = {
  blockCypherUrl: 'https://api.blockcypher.com/v1/btc/main/txs/',
  blockCypherTestUrl: 'https://api.blockcypher.com/v1/btc/test3/txs/',
  chainSoUrl: 'https://chain.so/api/v2/get_tx/BTC/',
  chainSoTestUrl: 'https://chain.so/api/v2/get_tx/BTCTEST/',

  // Add &apikey={key} to EtherScan URL's if getting rate limited
  etherScanMainUrl: 'https://api.etherscan.io/api?module=proxy',
  etherScanRopstenUrl: 'https://api-ropsten.etherscan.io/api?module=proxy'
};

const generateRevocationReason = function (reason) {
  reason = reason.trim();
  reason = reason.length > 0 ? ` Reason given: ${reason}${reason.slice(-1) !== '.' ? '.' : ''}` : '';
  return `This certificate has been revoked by the issuer.${reason}`;
};

// Minimum number of confirmations to consider a transaction valid. Recommended setting = 10
const MininumConfirmations = 1;
// Minimum number of blockchain APIs to consult to compare transaction data consistency
const MinimumBlockchainExplorers = 1;

const CheckForUnmappedFields = true;

const PublicKey = 'ecdsa-koblitz-pubkey:1';

// TODO Fixes or read direct in files??
const Contexts = {
  obi: {
    '@context': {
      'id': '@id',
      'type': '@type',

      'extensions': 'https://w3id.org/openbadges/extensions#',
      'obi': 'https://w3id.org/openbadges#',
      'validation': 'obi:validation',

      'cred': 'https://w3id.org/credentials#',
      'dc': 'http://purl.org/dc/terms/',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'AlignmentObject': 'schema:AlignmentObject',
      'CryptographicKey': 'sec:Key',
      'Endorsement': 'cred:Credential',

      'Assertion': 'obi:Assertion',
      'BadgeClass': 'obi:BadgeClass',
      'Criteria': 'obi:Criteria',
      'Evidence': 'obi:Evidence',
      'Extension': 'obi:Extension',
      'FrameValidation': 'obi:FrameValidation',
      'IdentityObject': 'obi:IdentityObject',
      'Image': 'obi:Image',
      'HostedBadge': 'obi:HostedBadge',
      'hosted': 'obi:HostedBadge',
      'Issuer': 'obi:Issuer',
      'Profile': 'obi:Profile',
      'RevocationList': 'obi:RevocationList',
      'SignedBadge': 'obi:SignedBadge',
      'signed': 'obi:SignedBadge',
      'TypeValidation': 'obi:TypeValidation',
      'VerificationObject': 'obi:VerificationObject',

      'author': {'@id': 'schema:author', '@type': '@id'},
      'caption': {'@id': 'schema:caption'},
      'claim': {'@id': 'cred:claim', '@type': '@id'},
      'created': {'@id': 'dc:created', '@type': 'xsd:dateTime'},
      'creator': {'@id': 'dc:creator', '@type': '@id'},
      'description': {'@id': 'schema:description'},
      'email': {'@id': 'schema:email'},
      'endorsement': {'@id': 'cred:credential', '@type': '@id'},
      'expires': {'@id': 'sec:expiration', '@type': 'xsd:dateTime'},
      'genre': {'@id': 'schema:genre'},
      'image': {'@id': 'schema:image', '@type': '@id'},
      'name': {'@id': 'schema:name'},
      'owner': {'@id': 'sec:owner', '@type': '@id'},
      'publicKey': {'@id': 'sec:publicKey', '@type': '@id'},
      'publicKeyPem': {'@id': 'sec:publicKeyPem'},
      'related': {'@id': 'dc:relation', '@type': '@id'},
      'startsWith': {'@id': 'http://purl.org/dqm-vocabulary/v1/dqm#startsWith'},
      'tags': {'@id': 'schema:keywords'},
      'targetDescription': {'@id': 'schema:targetDescription'},
      'targetFramework': {'@id': 'schema:targetFramework'},
      'targetName': {'@id': 'schema:targetName'},
      'targetUrl': {'@id': 'schema:targetUrl'},
      'telephone': {'@id': 'schema:telephone'},
      'url': {'@id': 'schema:url', '@type': '@id'},
      'version': {'@id': 'schema:version'},

      'alignment': {'@id': 'obi:alignment', '@type': '@id'},
      'allowedOrigins': {'@id': 'obi:allowedOrigins'},
      'audience': {'@id': 'obi:audience'},
      'badge': {'@id': 'obi:badge', '@type': '@id'},
      'criteria': {'@id': 'obi:criteria', '@type': '@id'},
      'endorsementComment': {'@id': 'obi:endorsementComment'},
      'evidence': {'@id': 'obi:evidence', '@type': '@id'},
      'hashed': {'@id': 'obi:hashed', '@type': 'xsd:boolean'},
      'identity': {'@id': 'obi:identityHash'},
      'issuedOn': {'@id': 'obi:issueDate', '@type': 'xsd:dateTime'},
      'issuer': {'@id': 'obi:issuer', '@type': '@id'},
      'narrative': {'@id': 'obi:narrative'},
      'recipient': {'@id': 'obi:recipient', '@type': '@id'},
      'revocationList': {'@id': 'obi:revocationList', '@type': '@id'},
      'revocationReason': {'@id': 'obi:revocationReason'},
      'revoked': {'@id': 'obi:revoked', '@type': 'xsd:boolean'},
      'revokedAssertions': {'@id': 'obi:revoked'},
      'salt': {'@id': 'obi:salt'},
      'targetCode': {'@id': 'obi:targetCode'},
      'uid': {'@id': 'obi:uid'},
      'validatesType': 'obi:validatesType',
      'validationFrame': 'obi:validationFrame',
      'validationSchema': 'obi:validationSchema',
      'verification': {'@id': 'obi:verify', '@type': '@id'},
      'verificationProperty': {'@id': 'obi:verificationProperty'},
      'verify': 'verification'
    }
  },
  blockcerts: {
    '@context': {
      'id': '@id',
      'type': '@type',
      'bc': 'https://w3id.org/blockcerts#',
      'obi': 'https://w3id.org/openbadges#',
      'cp': 'https://w3id.org/chainpoint#',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'MerkleProof2017': 'sec:MerkleProof2017',

      'RecipientProfile': 'bc:RecipientProfile',
      'SignatureLine': 'bc:SignatureLine',
      'MerkleProofVerification2017': 'bc:MerkleProofVerification2017',

      'recipientProfile': 'bc:recipientProfile',
      'signatureLines': 'bc:signatureLines',
      'introductionUrl': {'@id': 'bc:introductionUrl', '@type': '@id'},

      'subtitle': 'bc:subtitle',

      'jobTitle': 'schema:jobTitle',

      'creator': {'@id': 'dc:creator', '@type': '@id'},
      'expires': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'revoked': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'CryptographicKey': 'sec:Key',
      'signature': 'sec:signature',

      'verification': 'bc:verification',
      'publicKeys': 'bc:publicKeys',

      'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
      'BTCOpReturn': 'cp:BTCOpReturn',
      'targetHash': 'cp:targetHash',
      'merkleRoot': 'cp:merkleRoot',
      'proof': 'cp:proof',
      'anchors': 'cp:anchors',
      'sourceId': 'cp:sourceId',
      'right': 'cp:right',
      'left': 'cp:left'
    },
    'obi:validation': [
      {
        'obi:validatesType': 'RecipientProfile',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/recipientSchema.json'
      },
      {
        'obi:validatesType': 'SignatureLine',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/signatureLineSchema.json'
      },
      {
        'obi:validatesType': 'MerkleProof2017',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0-alpha/merkleProof2017Schema.json'
      }
    ]
  },
  blockcertsv1_2:

    {
      '@context': [
        {
          'id': '@id',
          'type': '@type',
          'bc': 'https://w3id.org/blockcerts#',
          'obi': 'https://w3id.org/openbadges#',
          'cp': 'https://w3id.org/chainpoint#',
          'extensions': 'https://w3id.org/openbadges/extensions#',
          'validation': 'obi:validation',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'schema': 'http://schema.org/',
          'sec': 'https://w3id.org/security#',
          'Assertion': 'bc:Assertion',
          'Certificate': 'bc:Certificate',
          'Issuer': 'bc:Issuer',
          'BlockchainCertificate': 'bc:BlockchainCertificate',
          'CertificateDocument': 'bc:CertificateDocument',
          'issuer': {
            '@id': 'bc:issuer',
            '@type': '@id'
          },
          'recipient': {
            '@id': 'bc:recipient',
            '@type': '@id'
          },
          'blockchaincertificate': {
            '@id': 'bc:blockchaincertificate',
            '@type': '@id'
          },
          'certificate': {
            '@id': 'bc:certificate',
            '@type': '@id'
          },
          'document': {
            '@id': 'bc:document',
            '@type': '@id'
          },
          'assertion': {
            '@id': 'bc:assertion',
            '@type': '@id'
          },
          'verify': {
            '@id': 'bc:verify',
            '@type': '@id'
          },
          'recipient': {
            '@id': 'bc:recipient',
            '@type': '@id'
          },
          'receipt': {
            '@id': 'bc:receipt',
            '@type': '@id'
          },
          'publicKey': {
            '@id': 'bc:publicKey'
          },
          'revocationKey': {
            '@id': 'bc:revocationKey'
          },
          'image:signature': {
            '@id': 'bc:image:signature'
          },
          'signature': {
            '@id': 'bc:signature'
          },
          'familyName': {
            '@id': 'schema:familyName'
          },
          'givenName': {
            '@id': 'schema:givenName'
          },
          'jobTitle': {
            '@id': 'schema:jobTitle'
          },
          'signer': {
            '@id': 'bc:signer',
            '@type': '@id'
          },
          'attribute-signed': {
            '@id': 'bc:attribute-signed'
          },
          'ECDSA(secp256k1)': 'bc:SignedBadge',
          'subtitle': {
            '@id': 'bc:subtitle'
          },
          'email': 'schema:email',
          'hashed': {
            '@id': 'obi:hashed',
            '@type': 'xsd:boolean'
          },
          'image': {
            '@id': 'schema:image',
            '@type': '@id'
          },
          'salt': {
            '@id': 'obi:salt'
          },
          'identity': {
            '@id': 'obi:identityHash'
          },
          'issuedOn': {
            '@id': 'obi:issueDate',
            '@type': 'xsd:dateTime'
          },
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime'
          },
          'evidence': {
            '@id': 'obi:evidence',
            '@type': '@id'
          },
          'criteria': {
            '@id': 'obi:criteria',
            '@type': '@id'
          },
          'tags': {
            '@id': 'schema:keywords'
          },
          'alignment': {
            '@id': 'obi:alignment',
            '@type': '@id'
          },
          'revocationList': {
            '@id': 'obi:revocationList',
            '@type': '@id'
          },
          'name': {
            '@id': 'schema:name'
          },
          'description': {
            '@id': 'schema:description'
          },
          'url': {
            '@id': 'schema:url',
            '@type': '@id'
          },
          'uid': {
            '@id': 'obi:uid'
          },
          'revocationList': 'obi:revocationList',
          'TypeValidation': 'obi:TypeValidation',
          'FrameValidation': 'obi:FrameValidation',
          'validatesType': 'obi:validatesType',
          'validationSchema': 'obi:validationSchema',
          'validationFrame': 'obi:validationFrame',
          'ChainpointSHA224v2': 'cp:ChainpointSHA224v2',
          'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
          'ChainpointSHA384v2': 'cp:ChainpointSHA384v2',
          'ChainpointSHA512v2': 'cp:ChainpointSHA512v2',
          'ChainpointSHA3-224v2': 'cp:ChainpointSHA3-224v2',
          'ChainpointSHA3-256v2': 'cp:ChainpointSHA3-256v2',
          'ChainpointSHA3-384v2': 'cp:ChainpointSHA3-384v2',
          'ChainpointSHA3-512v2': 'cp:ChainpointSHA3-512v2',
          'BTCOpReturn': 'cp:BTCOpReturn',
          'targetHash': 'cp:targetHash',
          'merkleRoot': 'cp:merkleRoot',
          'proof': 'cp:proof',
          'anchors': 'cp:anchors',
          'sourceId': 'cp:sourceId',
          'right': 'cp:right',
          'left': 'cp:left'
        }
      ],
      'validation': [
        {
          'type': 'TypeValidation',
          'validatesType': 'Assertion',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/assertion-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'Certificate',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/certificate-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'Issuer',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/issuer-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'CertificateDocument',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/certificate-document-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'BlockchainCertificate',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/blockchain-certificate-1.2.json'
        },
        {
          'type': 'TypeValidation',
          'validatesType': 'BlockchainReceipt',
          'validationSchema': 'https://w3id.org/blockcerts/schema/1.2/blockchain-receipt-1.2.json'
        }
      ]
    },
  blockcertsv2: {
    '@context': {
      'id': '@id',
      'type': '@type',
      'bc': 'https://w3id.org/blockcerts#',
      'obi': 'https://w3id.org/openbadges#',
      'cp': 'https://w3id.org/chainpoint#',
      'schema': 'http://schema.org/',
      'sec': 'https://w3id.org/security#',
      'xsd': 'http://www.w3.org/2001/XMLSchema#',

      'MerkleProof2017': 'sec:MerkleProof2017',

      'RecipientProfile': 'bc:RecipientProfile',
      'SignatureLine': 'bc:SignatureLine',
      'MerkleProofVerification2017': 'bc:MerkleProofVerification2017',

      'recipientProfile': 'bc:recipientProfile',
      'signatureLines': 'bc:signatureLines',
      'introductionUrl': {'@id': 'bc:introductionUrl', '@type': '@id'},

      'subtitle': 'bc:subtitle',

      'jobTitle': 'schema:jobTitle',

      'expires': {
        '@id': 'sec:expiration',
        '@type': 'xsd:dateTime'
      },
      'revoked': {
        '@id': 'obi:revoked',
        '@type': 'xsd:boolean'
      },
      'CryptographicKey': 'sec:Key',
      'signature': 'sec:signature',
      'verification': {
        '@id': 'obi:verify',
        '@type': '@id'
      },
      'publicKey': {
        '@id': 'sec:publicKey',
        '@type': '@id'
      },

      'ChainpointSHA256v2': 'cp:ChainpointSHA256v2',
      'BTCOpReturn': 'cp:BTCOpReturn',
      'targetHash': 'cp:targetHash',
      'merkleRoot': 'cp:merkleRoot',
      'proof': 'cp:proof',
      'anchors': 'cp:anchors',
      'sourceId': 'cp:sourceId',
      'right': 'cp:right',
      'left': 'cp:left'
    },
    'obi:validation': [
      {
        'obi:validatesType': 'RecipientProfile',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/recipientSchema.json'
      },
      {
        'obi:validatesType': 'SignatureLine',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/signatureLineSchema.json'
      },
      {
        'obi:validatesType': 'MerkleProof2017',
        'obi:validationSchema': 'https://w3id.org/blockcerts/schema/2.0/merkleProof2017Schema.json'
      }
    ]
  }
};

// TODO: use proper import. Disabled require because does not work in polymer-cli context
// require('string.prototype.startswith');
/*! http://mths.be/startswith v0.2.0 by @mathias */
if (!String.prototype.startsWith) {
  (function () {
    var defineProperty = (function () {
      // IE 8 only supports `Object.defineProperty` on DOM elements
      try {
        var object = {};
        var $defineProperty = Object.defineProperty;
        var result = $defineProperty(object, object, object) && $defineProperty;
      } catch (error) {}
      return result;
    }());
    var toString = {}.toString;
    var startsWith = function (search) {
      if (this == null) {
        throw TypeError();
      }
      var string = String(this);
      if (search && toString.call(search) == '[object RegExp]') {
        throw TypeError();
      }
      var stringLength = string.length;
      var searchString = String(search);
      var searchLength = searchString.length;
      var position = arguments.length > 1 ? arguments[1] : undefined;
      // `ToInteger`
      var pos = position ? Number(position) : 0;
      if (pos != pos) { // better `isNaN`
        pos = 0;
      }
      var start = Math.min(Math.max(pos, 0), stringLength);
      // Avoid the `indexOf` call if no match is possible
      if (searchLength + start > stringLength) {
        return false;
      }
      var index = -1;
      while (++index < searchLength) {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
          return false;
        }
      }
      return true;
    };
    if (defineProperty) {
      defineProperty(String.prototype, 'startsWith', {
        'value': startsWith,
        'configurable': true,
        'writable': true
      });
    } else {
      String.prototype.startsWith = startsWith;
    }
  }());
}

var isBitcoinMainnetAddress = function (bitcoinAddress) {
  if (bitcoinAddress.startsWith("1") || bitcoinAddress.startsWith(PublicKey)) {
    return true;
  }
  return false;
};

var getChain = function (signature, bitcoinAddress) {
  let anchor = signature.anchors[0];
  if (anchor.chain) {
    let chain = anchor.chain;
    if (chain == ChainSignatureValue.bitcoin) {
      return Blockchain.bitcoin;
    } else if (chain == ChainSignatureValue.testnet) {
      return Blockchain.testnet;
    } else if (chain == ChainSignatureValue.regtest) {
      return Blockchain.regtest;
    } else if (chain == ChainSignatureValue.mocknet) {
      return Blockchain.mocknet;
    }  else if (chain == ChainSignatureValue.ethmain) {
      return Blockchain.ethmain;
    } else if (chain == ChainSignatureValue.ethropst) {
      return Blockchain.ethropst;
    } else {
      throw new Error("Didn't recognize chain value")
    }
  }
  // Legacy path: we didn't support anything other than testnet and mainnet, so we check the address prefix
  // otherwise try to determine the chain from a bitcoin address
  if (isBitcoinMainnetAddress(bitcoinAddress)) {
    return Blockchain.bitcoin; // mainnet
  }
  return Blockchain.testnet;
};

var getNameForChain = function (chain) {
  return chain.toString();
};

/**
 * getTransactionId
 *
 * @returns {string|*}
 */
const getTransactionId = certificateReceipt => {
  try {
    return certificateReceipt.anchors[0].sourceId;
  } catch (e) {
    throw new VerifierError(
      "Can't verify this certificate without a transaction ID to compare against.",
    );
  }
};

/**
 * getRawTransactionLink
 *
 * Exposes the raw transaction link (empty string if does not exist)
 */
const getRawTransactionLink = (transactionId, chain) => {
  try {
    return BlockchainRawTransactionUrl[chain].replace(BlockchainRawTransactionIdPlaceholder, transactionId);
  } catch (e) {
    throw new VerifierError("Can't get the raw transaction link.");
  }
};

/**
 * getTransactionLink
 *
 * Exposes the transaction link (empty string if does not exist)
 */
const getTransactionLink = (transactionId, chain) => {
  try {
    return BlockchainTransactionUrl[chain].replace(BlockchainRawTransactionIdPlaceholder, transactionId);
  } catch (e) {
    throw new VerifierError("Can't get the raw transaction link.");
  }
};

class Certificate {
  constructor(version, name, title, subtitle, description, certificateImage, signatureImage, sealImage, id,
    issuer, receipt, signature, publicKey, revocationKey, chain, expires) {
    this.version = version;
    this.name = name;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.certificateImage = certificateImage;
    this.signatureImage = signatureImage;
    this.sealImage = sealImage;
    this.id = id;
    this.issuer = issuer;
    this.receipt = receipt;
    this.signature = signature;
    this.publicKey = publicKey;
    this.revocationKey = revocationKey;
    this.chain = chain;
    this.chainAsString = getNameForChain(chain);
    this.expires = expires;
    this.transactionId = getTransactionId(this.receipt);
    this.rawTransactionLink = getRawTransactionLink(this.transactionId, this.chain);
    this.transactionLink = getTransactionLink(this.transactionId, this.chain);
  }

  static parseV1(certificateJson) {
    const certificate = certificateJson.certificate || certificateJson.document.certificate;
    const recipient = certificateJson.recipient || certificateJson.document.recipient;
    const assertion = certificateJson.document.assertion;
    const certificateImage = certificate.image;
    const name = `${recipient.givenName} ${recipient.familyName}`;
    const title = certificate.title || certificate.name;
    const description = certificate.description;
    const signatureImage = certificateJson.document
      && certificateJson.document.assertion
      && certificateJson.document.assertion["image:signature"];
    const expires = assertion.expires;

    var signatureImageObjects = [];
    if (signatureImage.constructor === Array) {
      for (var index in signatureImage) {
        var signatureLine = signatureImage[index];
        var jobTitle = 'jobTitle' in signatureLine ? signatureLine.jobTitle : null;
        var signerName = 'name' in signatureLine ? signatureLine.name : null;
        var signatureObject = new SignatureImage(signatureLine.image, jobTitle, signerName);
        signatureImageObjects.push(signatureObject);
      }
    } else {
      var signatureObject = new SignatureImage(signatureImage, null, null);
      signatureImageObjects.push(signatureObject);
    }

    const sealImage = certificate.issuer.image;
    let subtitle = certificate.subtitle;
    if (typeof subtitle == "object") {
      subtitle = subtitle.display ? subtitle.content : "";
    }
    const id = assertion.uid;
    const issuer = certificate.issuer;
    const receipt = certificateJson.receipt;
    const signature = certificateJson.document.signature;
    const publicKey = recipient.publicKey;
    const revocationKey = recipient.revocationKey || null;

    let version;
    if (typeof receipt === "undefined") {
      version = CertificateVersion.v1_1;
    } else {
      version = CertificateVersion.v1_2;
    }

    var chain;
    if (isBitcoinMainnetAddress(publicKey)) {
      chain = Blockchain.bitcoin;
    } else {
      chain = Blockchain.testnet;
    }

    return new Certificate(version, name, title, subtitle, description, certificateImage, signatureImageObjects,
      sealImage, id, issuer, receipt, signature, publicKey, revocationKey, chain, expires);
  }

  static parseV2(certificateJson) {
    const { id, recipient, expires, signature: receipt, badge } = certificateJson;
    const { image: certificateImage, name: title, description, subtitle, issuer } = badge;
    const issuerKey = certificateJson.verification.publicKey || certificateJson.verification.creator;
    const recipientProfile = certificateJson.recipientProfile || certificateJson.recipient.recipientProfile;
    const sealImage = issuer.image;
    const publicKey = recipientProfile.publicKey;
    const name = recipientProfile.name;

    var signatureImageObjects = [];
    for (var index in badge.signatureLines) {
      var signatureLine = badge.signatureLines[index];
      var signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
      signatureImageObjects.push(signatureObject);
    }

    const chain = getChain(certificateJson.signature, issuerKey);
    return new Certificate(CertificateVersion.v2_0, name, title, subtitle, description, certificateImage,
      signatureImageObjects, sealImage, id, issuer, receipt, null, publicKey, null, chain, expires);
  }

  static parseJson(certificateJson) {
    const version = certificateJson["@context"];
    if (version instanceof Array) {
      return this.parseV2(certificateJson);
    } else {
      return this.parseV1(certificateJson);
    }
  }
}

class SignatureImage {
  constructor(image, jobTitle, name) {
    this.image = image;
    this.jobTitle = jobTitle;
    this.name = name;
  }
}

function noOffset(s) {
  let day = s.slice(0, -5).split(/\D/).map(function(itm) {
    return parseInt(itm, 10) || 0;
  });
  day[1] -= 1;
  day = new Date(Date.UTC.apply(Date, day));
  let offsetString = s.slice(-5);
  let offset = parseInt(offsetString, 10) / 100;
  if (offsetString.slice(0, 1) === '+') offset *= -1;
  day.setHours(day.getHours() + offset);
  return day.getTime();
}

function dateFromRegex(s) {
  let day;
  let tz;
  let rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,
    p = rx.exec(s) || [];
  if (p[1]) {
    day = p[1].split(/\D/).map(function(itm) {
      return parseInt(itm, 10) || 0;
    });
    day[1] -= 1;
    day = new Date(Date.UTC.apply(Date, day));
    if (!day.getDate()) return NaN;
    if (p[5]) {
      tz = parseInt(p[5], 10) / 100 * 60;
      if (p[6]) tz += parseInt(p[6], 10);
      if (p[4] === '+') tz *= -1;
      if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
    }
    return day;
  }
  return NaN;
}

function dateFromIso(isoDate) {
  // Chrome
  let diso = Date.parse(isoDate);
  if (diso) {
    return new Date(diso);
  }

  // JS 1.8 gecko
  let offsetDate = noOffset(isoDate);
  if (offsetDate) {
    return offsetDate;
  }

  return dateFromRegex(isoDate);
}

function dateToUnixTimestamp(date) {
  return dateFromIso(date);
}

const log = debug('checks');

require('string.prototype.startswith');

const {
  obi: OBI_CONTEXT,
  blockcerts: BLOCKCERTS_CONTEXT,
  blockcertsv1_2: BLOCKCERTSV1_2_CONTEXT,
  blockcertsv2: BLOCKCERTSV2_CONTEXT,
} = Contexts;
const CONTEXTS = {};
// Preload contexts
CONTEXTS[
  'https://w3id.org/blockcerts/schema/2.0-alpha/context.json'
] = BLOCKCERTS_CONTEXT;
CONTEXTS[
  'https://www.blockcerts.org/schema/2.0-alpha/context.json'
] = BLOCKCERTS_CONTEXT;
CONTEXTS['https://w3id.org/openbadges/v2'] = OBI_CONTEXT;
CONTEXTS['https://openbadgespec.org/v2/context.json'] = OBI_CONTEXT;
CONTEXTS['https://w3id.org/blockcerts/v2'] = BLOCKCERTSV2_CONTEXT;
CONTEXTS[
  'https://www.w3id.org/blockcerts/schema/2.0/context.json'
] = BLOCKCERTSV2_CONTEXT;
CONTEXTS['https://w3id.org/blockcerts/v1'] = BLOCKCERTSV1_2_CONTEXT;

function ensureNotRevokedBySpentOutput(
  revokedAddresses,
  issuerRevocationKey,
  recipientRevocationKey,
) {
  if (issuerRevocationKey) {
    const revokedAssertionId = revokedAddresses.findIndex(
      address => address === issuerRevocationKey,
    );
    const isRevokedByIssuer = revokedAssertionId !== -1;
    if (isRevokedByIssuer) {
      throw new VerifierError(
        Status.checkingRevokedStatus,
        generateRevocationReason(
          revokedAddresses[revokedAssertionId].revocationReason,
        ),
      );
    }
  }
  if (recipientRevocationKey) {
    const revokedAssertionId = revokedAddresses.findIndex(
      address => address === recipientRevocationKey,
    );
    const isRevokedByRecipient = revokedAssertionId !== -1;
    if (isRevokedByRecipient) {
      throw new VerifierError(
        Status.checkingRevokedStatus,
        generateRevocationReason(
          revokedAddresses[revokedAssertionId].revocationReason,
        ),
      );
    }
  }
}

function ensureNotRevokedByList(revokedAssertions, assertionUid) {
  if (!revokedAssertions) {
    // nothing to do
    return;
  }
  const revokedAddresses = revokedAssertions.map(output => output.id);
  const revokedAssertionId = revokedAddresses.findIndex(
    id => id === assertionUid,
  );
  const isRevokedByIssuer = revokedAssertionId !== -1;

  if (isRevokedByIssuer) {
    throw new VerifierError(
      Status.checkingRevokedStatus,
      generateRevocationReason(
        revokedAssertions[revokedAssertionId].revocationReason,
      ),
    );
  }
}

function ensureHashesEqual(actual, expected) {
  if (actual !== expected) {
    throw new VerifierError(
      Status.comparingHashes,
      'Computed hash does not match remote hash',
    );
  }
}

function ensureMerkleRootEqual(merkleRoot, remoteHash) {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError(
      Status.checkingMerkleRoot,
      'Merkle root does not match remote hash.',
    );
  }
}

function ensureValidIssuingKey(keyMap, txIssuingAddress, txTime) {
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
    throw new VerifierError(
      Status.checkingAuthenticity,
      'Transaction occurred at time when issuing address was not considered valid.',
    );
  }
}

function ensureValidReceipt(receipt) {
  var proofHash = receipt.targetHash;
  var merkleRoot = receipt.merkleRoot;
  try {
    var proof = receipt.proof;
    if (!!proof) {
      for (var index in proof) {
        const node = proof[index];
        if (typeof node.left !== 'undefined') {
          var appendedBuffer = _toByteArray(`${node.left}${proofHash}`);
          proofHash = sha256(appendedBuffer);
        } else if (typeof node.right !== 'undefined') {
          var appendedBuffer = _toByteArray(`${proofHash}${node.right}`);
          proofHash = sha256(appendedBuffer);
        } else {
          throw new VerifierError(
            Status.checkingReceipt,
            'We should never get here.',
          );
        }
      }
    }
  } catch (e) {
    throw new VerifierError(
      Status.checkingReceipt,
      'The receipt is malformed. There was a problem navigating the merkle tree in the receipt.',
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      Status.checkingReceipt,
      "Invalid Merkle Receipt. Proof hash didn't match Merkle root",
    );
  }
}

function getTransactionId$1(certificate) {
  let transactionId;
  try {
    transactionId = certificate.receipt.anchors[0].sourceId;
    return transactionId;
  } catch (e) {
    throw new VerifierError(
      Status.getTransactionId,
      "Can't verify this certificate without a transaction ID to compare against.",
    );
  }
}

function computeLocalHash(document, version) {
  var expandContext = document['@context'];
  var theDocument = document;
  if (version === CertificateVersion.v2_0 && CheckForUnmappedFields) {
    if (expandContext.find(x => x === Object(x) && '@vocab' in x)) {
      expandContext = null;
    } else {
      expandContext.push({ '@vocab': 'http://fallback.org/' });
    }
  }
  var nodeDocumentLoader = jsonld.documentLoaders.node();
  var customLoader = function(url, callback) {
    if (url in CONTEXTS) {
      return callback(null, {
        contextUrl: null,
        document: CONTEXTS[url],
        documentUrl: url,
      });
    }
    return nodeDocumentLoader(url, callback);
  };
  jsonld.documentLoader = customLoader;
  var normalizeArgs = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
  };
  if (expandContext) {
    normalizeArgs.expandContext = expandContext;
  }

  return new Promise((resolve, reject) => {
    jsonld.normalize(theDocument, normalizeArgs, (err, normalized) => {
      if (!!err) {
        reject(
          new VerifierError(
            Status.computingLocalHash,
            'Failed JSON-LD normalization',
          ),
        );
      } else {
        let unmappedFields = getUnmappedFields(normalized);
        if (unmappedFields) {
          reject(
            new VerifierError(
              Status.computingLocalHash,
              'Found unmapped fields during JSON-LD normalization',
            ),
          ); // + unmappedFields.join(",")
        } else {
          resolve(sha256(_toUTF8Data(normalized)));
        }
      }
    });
  });
}

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
}

function ensureNotExpired(expires) {
  if (!expires) {
    return;
  }
  var expiryDate = dateToUnixTimestamp(expires);
  if (new Date() >= expiryDate) {
    throw new VerifierError(
      Status.checkingExpiresDate,
      'This certificate has expired.',
    );
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
}

function _toUTF8Data(string) {
  var utf8 = [];
  for (var i = 0; i < string.length; i++) {
    var charcode = string.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    } else {
      // surrogate pair
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (string.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }
  return utf8;
}

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

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const log$1 = debug('promisifiedRequests');

function request(obj) {
  return new Promise((resolve, reject) => {
    let url = obj.url;
    let request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText);
      } else {
        let failureMessage = `Error fetching url:${url}; status code:${request.status}`;
        reject(new Error(failureMessage));
      }
    });
    request.ontimeout = (e) => {
      console.log('ontimeout', e);
    };
    request.onreadystatechange = () => {
      if (request.status === 404) {
        reject(new Error(`Error fetching url:${url}; status code:${request.status}`));
      }
    };
    request.addEventListener('error', () => {
      log$1(`Request failed with error ${request.responseText}`);
      reject(new Error(request.responseText));
    });

    request.responseType = 'json';
    request.open(obj.method || 'GET', url);

    if (obj.body) {
      request.send(JSON.stringify(obj.body));
    } else {
      request.send();
    }
  });
}

class TransactionData {
  constructor(remoteHash, issuingAddress, time, revokedAddresses) {
    this.remoteHash = remoteHash;
    this.issuingAddress = issuingAddress;
    this.time = time;
    this.revokedAddresses = revokedAddresses;
  }
}

class Key {
  constructor(publicKey, created, revoked, expires) {
    this.publicKey = publicKey;
    this.created = created;
    this.revoked = revoked;
    this.expires = expires;
  }
}

function parseIssuerKeys(issuerProfileJson) {
  try {
    var keyMap = {};
    if ('@context' in issuerProfileJson) {
      // backcompat for v2 alpha
      var responseKeys =
        issuerProfileJson.publicKey || issuerProfileJson.publicKeys;
      for (var i = 0; i < responseKeys.length; i++) {
        var key = responseKeys[i];
        var created = key.created ? dateToUnixTimestamp(key.created) : null;
        var revoked = key.revoked ? dateToUnixTimestamp(key.revoked) : null;
        var expires = key.expires ? dateToUnixTimestamp(key.expires) : null;
        // backcompat for v2 alpha
        var publicKeyTemp = key.id || key.publicKey;
        var publicKey = publicKeyTemp.replace('ecdsa-koblitz-pubkey:', '');
        var k = new Key(publicKey, created, revoked, expires);
        keyMap[k.publicKey] = k;
      }
    } else {
      // This is a v2 certificate with a v1 issuer
      const issuerKeys = issuerProfileJson.issuerKeys || [];
      var issuerKey = issuerKeys[0].key;
      var k = new Key(issuerKey, null, null, null);
      keyMap[k.publicKey] = k;
    }
    return keyMap;
  } catch (e) {
    throw new VerifierError(
      Status.parsingIssuerKeys,
      'Unable to parse JSON out of issuer identification data.',
    );
  }
}

function parseRevocationKey(issuerProfileJson) {
  if (
    issuerProfileJson.revocationKeys &&
    issuerProfileJson.revocationKeys.length > 0
  ) {
    return issuerProfileJson.revocationKeys[0].key;
  }
  return null;
}

function getIssuerProfile(issuerId) {
  let issuerProfileFetcher = new Promise((resolve, reject) => {
    return request({ url: issuerId })
      .then(response => {
        try {
          let issuerProfileJson = JSON.parse(response);
          resolve(issuerProfileJson);
        } catch (err) {
          reject(new VerifierError(Status.gettingIssuerProfile, err));
        }
      })
      .catch(err => {
        reject(new VerifierError(Status.gettingIssuerProfile, `Unable to get issuer profile`));
      });
  });
  return issuerProfileFetcher;
}

function getIssuerKeys(issuerId) {
  let issuerKeyFetcher = new Promise((resolve, reject) => {
    return getIssuerProfile(issuerId)
      .then(function(issuerProfileJson) {
        try {
          let issuerKeyMap = parseIssuerKeys(issuerProfileJson);
          resolve(issuerKeyMap);
        } catch (err) {
          reject(new VerifierError(Status.parsingIssuerKeys, err));
        }
      })
      .catch(function(err) {
        reject(new VerifierError(Status.parsingIssuerKeys, err));
      });
  });
  return issuerKeyFetcher;
}

function getRevokedAssertions(revocationListUrl) {
  if (!revocationListUrl) {
    return Promise.resolve([]);
  }
  let revocationListFetcher = new Promise((resolve, reject) => {
    return request({ url: revocationListUrl })
      .then(function(response) {
        try {
          let issuerRevocationJson = JSON.parse(response);
          let revokedAssertions = issuerRevocationJson.revokedAssertions
            ? issuerRevocationJson.revokedAssertions
            : [];
          resolve(revokedAssertions);
        } catch (err) {
          reject(new VerifierError(Status.parsingIssuerKeys, `Unable to get revocation assertion`));
        }
      })
      .catch(function(err) {
        reject(new VerifierError(Status.parsingIssuerKeys, `Unable to get revocation assertion`));
      });
  });
  return revocationListFetcher;
}

require('string.prototype.startswith');

function getEtherScanFetcher(transactionId, chain) {
  const action = "&action=eth_getTransactionByHash&txhash=";
  let etherScanUrl;
  if (chain === Blockchain.ethmain) {
    etherScanUrl = Url.etherScanMainUrl + action + transactionId;
  } else {
    etherScanUrl = Url.etherScanRopstenUrl + action + transactionId;
  }

  let etherScanFetcher = new Promise((resolve, reject) => {
    return request({url: etherScanUrl})
      .then(function (response) {
        const responseTxData = JSON.parse(response);
        try {
          // Parse block to get timestamp first, then create TransactionData
          let blockFetcher = getEtherScanBlock(responseTxData, chain);
          blockFetcher
            .then(function (blockResponse) {
              const txData = parseEtherScanResponse(responseTxData, blockResponse);
              resolve(txData);
            })
            .catch(function (err) {
              reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
            });
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
        }
      }).catch(function (err) {
        reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
      });
  });
  return etherScanFetcher;
}

function parseEtherScanResponse(jsonResponse, block) {
  const data = jsonResponse.result;
  const date = new Date(parseInt(block.timestamp, 16) * 1000);
  const issuingAddress = data.from;
  const opReturnScript = cleanupRemoteHash(data.input); // remove '0x'

  // The method of checking revocations by output spent do not work with Ethereum.
  // There are no input/outputs, only balances.
  return new TransactionData(opReturnScript, issuingAddress, date, undefined);
}

function getEtherScanBlock(jsonResponse, chain) {
  const data = jsonResponse.result;
  const blockNumber = data.blockNumber;
  const action = "&action=eth_getBlockByNumber&boolean=true&tag=";
  let etherScanUrl;
  if (chain === Blockchain.ethmain) {
    etherScanUrl = Url.etherScanMainUrl + action + blockNumber;
  } else {
    etherScanUrl = Url.etherScanRopstenUrl + action + blockNumber;
  }

  return new Promise((resolve, reject) => {
    return request({url: etherScanUrl})
      .then(function (response) {
        const responseData = JSON.parse(response);
        const blockData = responseData.result;
        try {
          let checkConfirmationsFetcher = checkEtherScanConfirmations(chain, blockNumber);
          checkConfirmationsFetcher
            .then(function () {
              resolve(blockData);
            }).catch(function (err) {
              reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
          });
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
        }
      }).catch(function (err) {
        reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
      });
  });
}

function checkEtherScanConfirmations(chain, blockNumber){
  const action = "&action=eth_blockNumber";
  let etherScanUrl;
  if (chain === Blockchain.ethmain) {
    etherScanUrl = Url.etherScanMainUrl + action;
  } else {
    etherScanUrl = Url.etherScanRopstenUrl + action;
  }

  return new Promise((resolve, reject) => {
    return request({url: etherScanUrl})
      .then(function (response) {
        const responseData = JSON.parse(response);
        const currentBlockCount = responseData.result;
        try {
          if (currentBlockCount - blockNumber < MininumConfirmations) {
            reject(new VerifierError(Status.fetchingRemoteHash, `Number of transaction confirmations were less than the minimum required, according to EtherScan API`));
          }
          resolve(currentBlockCount);
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
        }
      }).catch(function (err) {
        reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
      });
  });
}

function cleanupRemoteHash(remoteHash) {
  let prefix = "0x";
  if (remoteHash.startsWith(prefix)) {
    return remoteHash.slice(prefix.length);
  }
  return remoteHash;
}

require('string.prototype.startswith');

function getBlockcypherFetcher(transactionId, chain) {
  let blockCypherUrl;
  if (chain === Blockchain.bitcoin) {
    blockCypherUrl = Url.blockCypherUrl + transactionId + '?limit=500';
  } else {
    blockCypherUrl = Url.blockCypherTestUrl + transactionId + '?limit=500';
  }
  let blockcypherFetcher = new Promise((resolve, reject) => {
    return request({ url: blockCypherUrl })
      .then(function(response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseBlockCypherResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(err.message);
        }
      })
      .catch(function(err) {
        reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
      });
  });
  return blockcypherFetcher;
}

function getChainSoFetcher(transactionId, chain) {
  let chainSoUrl;
  if (chain === Blockchain.bitcoin) {
    chainSoUrl = Url.chainSoUrl + transactionId;
  } else {
    chainSoUrl = Url.chainSoTestUrl + transactionId;
  }

  let chainSoFetcher = new Promise((resolve, reject) => {
    return request({ url: chainSoUrl })
      .then(function(response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseChainSoResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
        }
      })
      .catch(function(err) {
        reject(new VerifierError(Status.fetchingRemoteHash, `Unable to get remote hash`));
      });
  });
  return chainSoFetcher;
}

function parseBlockCypherResponse(jsonResponse) {
  if (jsonResponse.confirmations < MininumConfirmations) {
    throw new VerifierError(
      'Number of transaction confirmations were less than the minimum required, according to Blockcypher API',
    );
  }
  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = cleanupRemoteHash$1(lastOutput.script);
  var revokedAddresses = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses,
  );
}

function parseChainSoResponse(jsonResponse) {
  if (jsonResponse.data.confirmations < MininumConfirmations) {
    throw new VerifierError(
      'Number of transaction confirmations were less than the minimum required, according to Chain.so API',
    );
  }
  const time = new Date(jsonResponse.data.time * 1000);
  const outputs = jsonResponse.data.outputs;
  var lastOutput = outputs[outputs.length - 1];
  var issuingAddress = jsonResponse.data.inputs[0].address;
  const opReturnScript = cleanupRemoteHash$1(lastOutput.script);
  // Legacy v1.2 verification notes:
  // Chain.so requires that you lookup spent outputs per index, which would require potentially a lot of calls. However,
  // this is only for v1.2 so we will allow connectors to omit revoked addresses. Blockcypher returns revoked addresses,
  // and ideally we would provide at least 1 more connector to crosscheck the list of revoked addresses. There were very
  // few v1.2 issuances, but you want to provide v1.2 verification with higher confidence (of cross-checking APIs), then
  // you should consider adding an additional lookup to crosscheck revocation addresses.
  return new TransactionData(opReturnScript, issuingAddress, time, undefined);
}

function cleanupRemoteHash$1(remoteHash) {
  let prefixes = ['6a20', 'OP_RETURN '];
  for (var i = 0; i < prefixes.length; i++) {
    let prefix = prefixes[i];
    if (remoteHash.startsWith(prefix)) {
      return remoteHash.slice(prefix.length);
    }
  }
  return remoteHash;
}

const log$2 = debug("blockchainConnectors");

const BitcoinExplorers = [
  (transactionId, chain) => getChainSoFetcher(transactionId, chain),
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain),
];

const EthereumExplorers = [
  (transactionId, chain) => getEtherScanFetcher(transactionId, chain)
];

// for legacy (pre-v2) Blockcerts
const BlockchainExplorersWithSpentOutputInfo = [
  (transactionId, chain) => getBlockcypherFetcher(transactionId, chain)
];


function lookForTx(transactionId, chain, certificateVersion) {
  var BlockchainExplorers;
  switch (chain) {
    case Blockchain.bitcoin:
    case Blockchain.regtest:
    case Blockchain.testnet:
    case Blockchain.mocknet:
      BlockchainExplorers = BitcoinExplorers;
      break;
    case Blockchain.ethmain:
    case Blockchain.ethropst:
      BlockchainExplorers = EthereumExplorers;
      break;
    default:
      return Promise.reject(new VerifierError(Status.fetchingRemoteHash, `Invalid chain; does not map to known BlockchainExplorers.`));
  }

  // First ensure we can satisfy the MinimumBlockchainExplorers setting
  if (MinimumBlockchainExplorers > BlockchainExplorers.length) {
    return Promise.reject(new VerifierError(Status.fetchingRemoteHash, `Invalid application configuration; check the MinimumBlockchainExplorers configuration value`));
  }
  if (MinimumBlockchainExplorers > BlockchainExplorersWithSpentOutputInfo.length &&
      (certificateVersion == CertificateVersion.v1_1 || certificateVersion == CertificateVersion.v1_2)) {
    return Promise.reject(new VerifierError(Status.fetchingRemoteHash, `Invalid application configuration; check the MinimumBlockchainExplorers configuration value`));
  }

  // Queue up blockchain explorer APIs
  let promises = Array();
  if (certificateVersion == CertificateVersion.v1_1 || certificateVersion == CertificateVersion.v1_2) {
    var limit = MinimumBlockchainExplorers;
    for (var i = 0; i < limit; i++) {
      promises.push(BlockchainExplorersWithSpentOutputInfo[i](transactionId, chain));
    }
  } else {
    var limit = MinimumBlockchainExplorers;
    for (var j = 0; j < limit; j++) {
      promises.push(BlockchainExplorers[j](transactionId, chain));
    }
  }

  return new Promise((resolve, reject) => {
    return PromiseProperRace(promises, MinimumBlockchainExplorers).then(winners => {
      if (!winners || winners.length == 0) {
        return Promise.reject(new VerifierError(Status.fetchingRemoteHash, `Could not confirm the transaction. No blockchain apis returned a response. This could be because of rate limiting.`));
      }

      // Compare results returned by different blockchain apis. We pick off the first result and compare the others
      // returned. The number of winners corresponds to the configuration setting `MinimumBlockchainExplorers`.
      // We require that all results agree on `issuingAddress` and `remoteHash`. Not all blockchain apis return
      // spent outputs (revoked addresses for <=v1.2), and we do not have enough coverage to compare this, but we do
      // ensure that a TxData with revoked addresses is returned, for the rare case of legacy 1.2 certificates.
      //
      // Note that APIs returning results where the number of confirmations is less than `MininumConfirmations` are
      // filtered out, but if there are at least `MinimumBlockchainExplorers` reporting that the number of confirmations
      // are above the `MininumConfirmations` threshold, then we can proceed with verification.
      var firstResponse = winners[0];
      for (var i = 1; i < winners.length; i++) {
        var thisResponse = winners[i];
        if (firstResponse.issuingAddress !== thisResponse.issuingAddress) {
          throw new VerifierError(Status.fetchingRemoteHash, `Issuing addresses returned by the blockchain APIs were different`);
        }
        if (firstResponse.remoteHash !== thisResponse.remoteHash) {
          throw new VerifierError(Status.fetchingRemoteHash, `Remote hashes returned by the blockchain APIs were different`);
        }
      }
      resolve(firstResponse);
    }).catch(err => {
      reject(new VerifierError(Status.fetchingRemoteHash, err.message));
    });
  });
}

var PromiseProperRace = function (promises, count, results = []) {
  // Source: https://www.jcore.com/2016/12/18/promise-me-you-wont-use-promise-race/
  promises = Array.from(promises);
  if (promises.length < count) {
    return Promise.reject(new VerifierError(Status.fetchingRemoteHash, `Could not confirm the transaction`));
  }

  let indexPromises = promises.map((p, index) => p.then(() => index).catch((err) => {
    log$2(err);
    throw index;
  }));

  return Promise.race(indexPromises).then(index => {
    let p = promises.splice(index, 1)[0];
    p.then(e => results.push(e));
    if (count === 1) {
      return results;
    }
    return PromiseProperRace(promises, count - 1, results);
  }).catch(index => {
    promises.splice(index, 1);
    return PromiseProperRace(promises, count, results);
  });
};

const log$3 = debug('verifier');

var noop = function() {};

class CertificateVerifier {
  constructor(certificateString, statusCallback) {
    const certificateJson = JSON.parse(certificateString);
    this.certificate = Certificate.parseJson(certificateJson);
    let document = certificateJson.document;
    if (!document) {
      var certCopy = JSON.parse(certificateString);
      delete certCopy['signature'];
      document = certCopy;
    }
    this.document = document;
    this.statusCallback = statusCallback || noop;
    this.completionCallback = null;
    
    // v1.1 only
    this.certificateString = certificateString;

    // Final verification result
    // Init status as success, we will update the final status at the end
    this._stepsStatuses = [];
  }

  /**
   * _updateCallback
   * 
   * calls the origin callback to update on a step status
   * 
   * @param {*} stepCode 
   * @param {*} message 
   * @param {*} status 
   */
  _updateCallback(stepCode, message, status) {
    if (stepCode != null) {
      this.statusCallback(stepCode, message, status);
    }
  }

  /**
   * _succeed
   * 
   * @param {*} completionCallback 
   */
  _succeed(completionCallback) {
    let status;
    if (
      this.certificate.chain === Blockchain.mocknet ||
      this.certificate.chain === Blockchain.regtest
    ) {
      log$3(
        'This mock Blockcert passed all checks. Mocknet mode is only used for issuers to test their workflow locally. This Blockcert was not recorded on a blockchain, and it should not be considered a verified Blockcert.',
      );
      status = Status.mockSuccess;
    } else {
      log$3('success');
      status = Status.success;
    }
  
    this.completionCallback(Status.final, '', status);
    return status;
  }

  /**
   * _failed
   * 
   * @param {*} stepCode 
   * @param {*} completionCallback 
   * @param {*} err 
   */
  _failed(stepCode, message) {
    stepCode = stepCode || '';
    message = message || '';
    log$3(`failure:${message}`);
    
    this.completionCallback(stepCode, message, Status.failure);
    return Status.failure;
  }

  /**
   * _isFailing
   *
   * whether or not the current verification is failing
   *
   * @returns {boolean}
   * @private
   */
  _isFailing() {
    return this._stepsStatuses.length > 0 && this._stepsStatuses.indexOf(Status.failure) > -1;
  }

  /**
   * doAction
   *
   * @param stepCode
   * @param action
   * @returns {*}
   */
  doAction(stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

	  let message = getVerboseMessage(stepCode);
    log$3(message);
    this._updateCallback(stepCode, message, Status.starting);

    try {
      let res = action();
      this._updateCallback(stepCode, message, Status.success);
      this._stepsStatuses.push(Status.success);
      return res;
    } catch(err) {
      this._updateCallback(stepCode, err.message, Status.failure);
      this._stepsStatuses.push(Status.failure);
    }
  }

  /**
   * doAsyncAction
   *
   * @param stepCode
   * @param action
   * @returns {Promise<*>}
   */
  async doAsyncAction(stepCode, action) {
    // If not failing already
    if (this._isFailing()) {
      return;
    }

    let message;
    if (stepCode != null) {
      message = getVerboseMessage(stepCode);
      log$3(message);
      this._updateCallback(stepCode, message, Status.starting);
    }

    try {
      let res = await action();
      this._updateCallback(stepCode, message, Status.success);
      this._stepsStatuses.push(Status.success);
      return res;
    } catch(err) {
      this._updateCallback(stepCode, err.message, Status.failure);
      this._stepsStatuses.push(Status.failure);
    }
  }

  /**
   * verifyV1_2
   *
   * Verified certificate v1.2
   *
   * @returns {Promise<void>}
   */
  async verifyV1_2() {
    // Get transaction
    let transactionId = this.doAction(
      Status.getTransactionId,
      () => getTransactionId$1(this.certificate)
    );

    let docToVerify = this.document;

    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        computeLocalHash(docToVerify, this.certificate.version),
    );

    // Get remote hash
    let txData = await this.doAsyncAction(Status.fetchingRemoteHash, async () =>
      lookForTx(
        transactionId,
        this.certificate.chain,
        this.certificate.version,
      ),
    );

    // Get issuer profile
    let issuerProfileJson = await this.doAsyncAction(
      Status.gettingIssuerProfile,
      async () => getIssuerProfile(this.certificate.issuer.id),
    );

    // Parse issuer keys
    let issuerKeyMap = await this.doAsyncAction(
      Status.parsingIssuerKeys,
      () => parseIssuerKeys(issuerProfileJson),
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () => {
        ensureHashesEqual(localHash, this.certificate.receipt.targetHash);
      }
    );

    // Check merkle root
    this.doAction(Status.checkingMerkleRoot, () =>
      ensureMerkleRootEqual(
        this.certificate.receipt.merkleRoot,
        txData.remoteHash,
      ),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      ensureValidReceipt(this.certificate.receipt),
    );

    // Check revoke status
    this.doAction(Status.checkingRevokedStatus, () =>
      ensureNotRevokedBySpentOutput(
        txData.revokedAddresses,
        parseRevocationKey(issuerProfileJson),
        this.certificate.revocationKey,
      ),
    );

    // Check authenticity
    this.doAction(Status.checkingAuthenticity, () =>
      ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time,
      ),
    );

    // Check expiration
    this.doAction(Status.checkingExpiresDate, () =>
      ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verifyV2
   *
   * Verified certificate v2
   *
   * @returns {Promise<void>}
   */
  async verifyV2() {
    // Get transaction
    let transactionId = this.doAction(
      Status.getTransactionId,
      () => getTransactionId$1(this.certificate)
    );
    
    let docToVerify = this.document;

    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        computeLocalHash(docToVerify, this.certificate.version),
    );

    // Fetch remote hash
    let txData = await this.doAsyncAction(
      Status.fetchingRemoteHash,
      async () => {
        return lookForTx(transactionId, this.certificate.chain);
      }
    );

    // Get issuer keys
    let issuerKeyMap = await this.doAsyncAction(
      Status.parsingIssuerKeys,
      async () => {
        return getIssuerKeys(this.certificate.issuer.id);
      }
    );

    // Get issuer keys
    let revokedAssertions = await this.doAsyncAction(
      null,
      async () => {
        return getRevokedAssertions(this.certificate.issuer.revocationList);
      }
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () =>
      ensureHashesEqual(localHash, this.certificate.receipt.targetHash),
    );

    // Check merkle root
    this.doAction(Status.checkingMerkleRoot, () =>
      ensureMerkleRootEqual(
        this.certificate.receipt.merkleRoot,
        txData.remoteHash,
      ),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      ensureValidReceipt(this.certificate.receipt),
    );

    // Check revoked status
    this.doAction(Status.checkingRevokedStatus, () =>
      ensureNotRevokedByList(revokedAssertions, this.certificate.id),
    );

    // Check authenticity
    this.doAction(Status.checkingAuthenticity, () =>
      ensureValidIssuingKey(
        issuerKeyMap,
        txData.issuingAddress,
        txData.time,
      ),
    );

    // Check expiration date
    this.doAction(Status.checkingExpiresDate, () =>
      ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verifyV2Mock
   *
   * Verify a v2 mock certificate
   *
   * @returns {Promise<void>}
   */
  async verifyV2Mock() {
    let docToVerify = this.document;
    // Compute local hash
    let localHash = await this.doAsyncAction(
      Status.computingLocalHash,
      async () =>
        computeLocalHash(docToVerify, this.certificate.version),
    );

    // Compare hashes
    this.doAction(Status.comparingHashes, () =>
      ensureHashesEqual(localHash, this.certificate.receipt.targetHash),
    );

    // Check receipt
    this.doAction(Status.checkingReceipt, () =>
      ensureValidReceipt(this.certificate.receipt),
    );

    // Check expiration date
    this.doAction(Status.checkingExpiresDate, () =>
      ensureNotExpired(this.certificate.expires),
    );
  }

  /**
   * verify
   *
   * @param completionCallback
   * @returns {Promise<*>}
   */
  async verify(completionCallback) {
    if (this.certificate.version === CertificateVersion.v1_1) {
      throw new VerifierError(
        '',
        'Verification of 1.1 certificates is not supported by this component. See the python cert-verifier for legacy verification',
      );
    }

    // Save completion callback
    this.completionCallback = completionCallback || noop;
    try {
      if (this.certificate.version === CertificateVersion.v1_2) {
        await this.verifyV1_2();
      } else if (
        this.certificate.chain === Blockchain.mocknet ||
        this.certificate.chain === Blockchain.regtest
      ) {
        await this.verifyV2Mock();
      } else {
        await this.verifyV2();
      }

      // Send final callback update for global verification status
      if (this._stepsStatuses.indexOf(Status.failure) > -1) {
        return this._failed(Status.final);
      } else {
        return this._succeed();
      }
    } catch (e) {
      //return this._failed(e.stepCode, e.message);
    }
  }
}

/*
import {readFileAsync} from './promisifiedRequests'

function statusCallback(arg1) {
  console.log(`callback status: ${arg1}`);
}

async function test() {
  try {
    //var data = await readFileAsync('../tests/data/sample_cert-revoked-2.0.json');
    var data = await readFileAsync('../tests/data/sample_cert-valid-1.2.0.json')
    var certVerifier = new CertificateVerifier(data, statusCallback);
    certVerifier.verify((status, message) => {
      console.log("completion status: " + status);
      if (message) {
        console.error("completion message: " + message);
      }
    }).catch((err) => {console.error("Unexpected error: " + err)})
  } catch (err) {
    console.error('Failed!');
    console.error(err);
  }
}

test();
*/

export { Blockchain, CertificateVersion, Status, Certificate, SignatureImage, CertificateVerifier };
