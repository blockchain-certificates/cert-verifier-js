'use strict';

import { Blockchain, BlockchainRawTransactionUrl, BlockchainTransactionUrl, BlockchainRawTransactionIdPlaceholder, ChainSignatureValue, CertificateVersion, PublicKey, VerifierError } from '../config/default';

require('string.prototype.startswith');


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
      throw new VError("Didn't recognize chain value")
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

export class Certificate {
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
      subtitle = subtitle.display ? subtitle.content : ""
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

export class SignatureImage {
  constructor(image, jobTitle, name) {
    this.image = image;
    this.jobTitle = jobTitle;
    this.name = name;
  }
}