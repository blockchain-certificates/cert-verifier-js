'use strict';

import {assert, expect} from 'chai'
import {CertificateVerifier} from '../lib/index'
import {readFileAsync} from '../lib/promisifiedRequests'
import {Status} from '../config/default'

describe("Certificate verifier", async () => {

  describe("verify v1", async () => {
    it("verifies a v1 certificate", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-1.2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var result = await certVerifier.verify((finalMessage) => {console.log(finalMessage)});
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, "This should not fail");
      }
    });

  });

  describe("verify v2", () => {
    it("verifies a v2 certificate", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var result = await certVerifier.verify((finalMessage) => {console.log(finalMessage)});
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, "This should not fail");
      }
    });

    it("verifies a v2 alpha certificate", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-2.0-alpha.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var result = await certVerifier.verify((finalMessage) => {console.log(finalMessage)});
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, "This should not fail");
      }
    });

    it("ensures a tampered v2 certificate fails", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-unmapped-2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {returnMessage = message});
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, "Found unmapped fields during JSON-LD normalization: <http://fallback.org/someUnmappedField>,someUnmappedField");
      } catch (err) {
        assert.fail(err, null, "Caught unexpected exception");
      }
    });

    it("ensures a revoked v2 certificate fails", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-revoked-2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var result = await certVerifier.verify((finalMessage) => {console.log(finalMessage)});
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {returnMessage = message});
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, "This certificate has been revoked by the issuer.");
      } catch (err) {
        assert.fail(err, null, "Caught unexpected exception");
      }
    });

    it("ensures a v2 certificate with a revoked issuing key fails", async () => {
      // In other words, transaction happened after issuing key was revoked
      try {
        var data = await readFileAsync('tests/data/sample_cert-with-revoked-key-2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {returnMessage = message});
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, "Transaction occurred at time when issuing address was not considered valid.");
      } catch (err) {
        assert.fail(err, null, "Caught unexpected exception");
      }
    });

    it("ensures a v2 certificate with a v1 issuer passes", async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-with_v1_issuer-2.0.json');
        var certVerifier = new CertificateVerifier(data, (statusMessage) => {console.log(statusMessage)});
        var result = await certVerifier.verify((finalMessage) => {console.log(finalMessage)});
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, "This should not fail");
      }
    });
  });

});