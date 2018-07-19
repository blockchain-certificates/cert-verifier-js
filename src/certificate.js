import domain from './domain';
import { BLOCKCHAINS } from './constants/blockchains';
import * as CERTIFICATE_VERSIONS from './constants/certificateVersions';

export class Certificate {
  constructor (version, name, title, subtitle, description, certificateImage, signatureImage, sealImage, id, issuer, receipt, signature, publicKey, revocationKey, chainObject, expires) {
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
    this.chainCode = chainObject.code;
    this.chainName = chainObject.name;
    this.expires = expires;
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.rawTransactionLink = domain.certificates.getTransactionLink(this.transactionId, chainObject, true);
    this.transactionLink = domain.certificates.getTransactionLink(this.transactionId, chainObject);
  }

  static parseV1 (certificateJson) {
    const certificate = certificateJson.certificate || certificateJson.document.certificate;
    const recipient = certificateJson.recipient || certificateJson.document.recipient;
    const assertion = certificateJson.document.assertion;
    const certificateImage = certificate.image;
    const name = `${recipient.givenName} ${recipient.familyName}`;
    const title = certificate.title || certificate.name;
    const description = certificate.description;
    const signatureImage = certificateJson.document && certificateJson.document.assertion && certificateJson.document.assertion['image:signature'];
    const expires = assertion.expires;

    var signatureImageObjects = [];
    if (signatureImage.constructor === Array) {
      for (var index in signatureImage) {
        var signatureLine = signatureImage[index];
        var jobTitle = 'jobTitle' in signatureLine ? signatureLine.jobTitle : null;
        var signerName = 'name' in signatureLine ? signatureLine.name : null;
        let signatureObject = new SignatureImage(signatureLine.image, jobTitle, signerName);
        signatureImageObjects.push(signatureObject);
      }
    } else {
      let signatureObject = new SignatureImage(signatureImage, null, null);
      signatureImageObjects.push(signatureObject);
    }

    const sealImage = certificate.issuer.image;
    let subtitle = certificate.subtitle;
    if (typeof subtitle === 'object') {
      subtitle = subtitle.display ? subtitle.content : '';
    }
    const id = assertion.uid;
    const issuer = certificate.issuer;
    const receipt = certificateJson.receipt;
    const signature = certificateJson.document.signature;
    const publicKey = recipient.publicKey;
    const revocationKey = recipient.revocationKey || null;

    let version;
    if (typeof receipt === 'undefined') {
      version = CERTIFICATE_VERSIONS.v1dot1;
    } else {
      version = CERTIFICATE_VERSIONS.v1dot2;
    }

    // Get chain object
    let chainObject = domain.addresses.isMainnet(publicKey) ? BLOCKCHAINS.bitcoin : BLOCKCHAINS.testnet;

    return new Certificate(version, name, title, subtitle, description, certificateImage, signatureImageObjects,
      sealImage, id, issuer, receipt, signature, publicKey, revocationKey, chainObject, expires);
  }

  static parseV2 (certificateJson) {
    const {id, expires, signature: receipt, badge} = certificateJson;
    const {image: certificateImage, name: title, description, subtitle, issuer} = badge;
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

    const chainObject = domain.certificates.getChain(certificateJson.signature, issuerKey);
    return new Certificate(CERTIFICATE_VERSIONS.v2dot0, name, title, subtitle, description, certificateImage,
      signatureImageObjects, sealImage, id, issuer, receipt, null, publicKey, null, chainObject, expires);
  }

  static parseJson (certificateJson) {
    const version = certificateJson['@context'];
    if (version instanceof Array) {
      return this.parseV2(certificateJson);
    } else {
      return this.parseV1(certificateJson);
    }
  }
}

export class SignatureImage {
  constructor (image, jobTitle, name) {
    this.image = image;
    this.jobTitle = jobTitle;
    this.name = name;
  }
}
