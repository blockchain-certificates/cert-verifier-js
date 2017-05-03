'use strict';
var CertificateVersion = require('./certificateVersion');
var GUID_REGEX = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/;

class Certificate {
  constructor(version, name, title, subtitle, description, certificateImage, signatureImage, sealImage, uid,
              issuer, receipt, signature, publicKey, revocationKey) {
    this.version = version;
    this.name = name;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.certificateImage = certificateImage;
    this.signatureImage = signatureImage;
    this.sealImage = sealImage;
    this.uid= uid;
    this.issuer = issuer;
    this.receipt = receipt;
    this.signature = signature;
    this.publicKey = publicKey;
    this.revocationKey = revocationKey;
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


    var signatureImageObjects = [];
    if (signatureImage.constructor === Array) {
      for (var index in badge.signatureLines) {
        var signatureLine = badge.signatureLines[index];
        var signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle || null,
          signatureLine.name || null);
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
    const uid = assertion.uid;
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

    return new Certificate(version, name, title, subtitle, description, certificateImage, signatureImageObjects, sealImage, uid,
      issuer, receipt, signature, publicKey, revocationKey);
  }

  static parseV2(certificateJson) {
    const recipient = certificateJson.recipient;
    const badge = certificateJson.badge;
    const certificateImage = certificateJson.image;
    const name = recipient.recipientProfile.name;
    const title = badge.name;
    const description = badge.description;

    var signatureImageObjects = [];
    for (var index in badge.signatureLines) {
      var signatureLine = badge.signatureLines[index];
      var signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
      signatureImageObjects.push(signatureObject);
    }

    const sealImage = badge.issuer.image;
    const subtitle = badge.subtitle;

    const matches = GUID_REGEX.exec(certificateJson.id);
    const uid = matches[0];
    const issuer = badge.issuer;
    const receipt = certificateJson.signature;
    const publicKey = recipient.recipientProfile.publicKey;
    return new Certificate(CertificateVersion.v2_0, name, title, subtitle, description, certificateImage,
      signatureImageObjects, sealImage, uid, issuer, receipt, null, publicKey);
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

module.exports = Certificate;


var fs = require('fs');

fs.readFile('../tests/sample_cert-valid-1.2.0.json', 'utf8', function (err, data) {
  if (err) {
    console.log(err);
  }

  let cert = Certificate.parseJson(JSON.parse(data));
  console.log(cert.name);

});