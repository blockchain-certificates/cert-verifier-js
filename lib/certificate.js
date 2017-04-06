'use strict';

class Certificate {
  constructor(name, title, subtitle, description, certificateImage, signatureImage, sealImage) {
    this.name = name;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.certificateImage = certificateImage;
    this.signatureImage = signatureImage;
    this.sealImage = sealImage;
  }

  static parseV1(certificateJson) {
    const certificate = certificateJson.certificate || certificateJson.document.certificate;
    const recipient = certificateJson.recipient || certificateJson.document.recipient;
    const certificateImage = certificate.image;
    const name = `${recipient.givenName} ${recipient.familyName}`;
    const title = certificate.title || certificate.name;
    const description = certificate.description;
    const signatureImage = certificateJson.document
      && certificateJson.document.assertion
      && certificateJson.document.assertion["image:signature"];
    const sealImage = certificate.issuer.image;
    let subtitle = certificate.subtitle;
    if (typeof subtitle == "object") {
      subtitle = subtitle.display ? subtitle.content : ""
    }
    return new Certificate(name, title, subtitle, description, certificateImage, signatureImage, sealImage)
  }

  static parseV2(certificateJson) {
    const recipient = certificateJson.recipient;
    const badge = certificateJson.badge;
    const certificateImage = certificateJson.image;
    const name = recipient.recipientProfile.name;
    const title = badge.name;
    const description = badge.description;
    const signatureImage = badge.signatureLines;
    const sealImage = badge.issuer.image;
    let subtitle = badge.subtitle;
    return new Certificate(name, title, subtitle, description, certificateImage, signatureImage, sealImage)
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

module.exports = Certificate;
