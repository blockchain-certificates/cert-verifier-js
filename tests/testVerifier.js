'use strict';

import { assert, expect } from 'chai'
import  fs  from 'fs'
import { CertificateVerifier } from '../lib/index'


describe("Certificate verifier", function() {

  describe("verify v1", function() {
    it("verifies a v1 certificate", function(done) {
      this.timeout(3000);
      fs.readFile('tests/data/sample_cert-valid-1.2.0.json', 'utf8', function (err, data) {
        if (err) {
          assert.fail();
          done(err);
        }
        var certVerifier = new CertificateVerifier(data);

        certVerifier.verify(function(err, data) {
          assert.isNotOk(err);
          assert.isOk(data);
          done();
        });
      });
    });

    it("ensures an expired v1 certificate fails", function(done) {
      this.timeout(3000);
      fs.readFile('tests/data/sample_cert-expired-1.2.0.json', 'utf8', function (err, data) {
        if (err) {
          assert.fail();
          done(err);
        }
        var certVerifier = new CertificateVerifier(data);
        // This just checks the expiration date since the certificate was modified to expire it. We should issue an 
        // expires certificate as well for an end-to-end test case.
        certVerifier._checkExpiryDate(function(err, data) {
          assert.isOk(err);
          expect(data).to.contain("expired");
          done();
        });
      });
    });
  });

  describe("verify v2", function() {
    it("verifies a v2 certificate", function(done) {
      this.timeout(10000);
      fs.readFile('tests/data/sample_cert-valid-2.0.json', 'utf8', function (err, data) {
        if (err) {
          assert.fail();
          return done(err);
        }
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function (err, data) {
          assert.isNotOk(err);
          assert.isOk(data);
          done();
        });
      });
    });

    it("ensures a tampered v2 certificate fails", function(done) {
      this.timeout(10000);
      fs.readFile('tests/data/sample_cert-unmapped-2.0.json', 'utf8', function (err, data) {
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function(err, data) {
          assert.isOk(err);
          expect(data).to.contain("Found unmapped fields during JSON-LD normalization");
          done();
        });
      });
    });

    it("ensures a revoked v2 certificate fails", function(done) {
      this.timeout(10000);
      fs.readFile('tests/data/sample_cert-revoked-2.0.json', 'utf8', function (err, data) {
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function(err, data) {
          assert.isOk(err);
          expect(data).to.equal("This certificate has been revoked by the issuer.");
          done();
        });
      });
    });

    it("ensures a v2 certificate with a revoked issuing key fails", function(done) {
      // In other words, transaction happened after issuing key was revoked
      this.timeout(10000);
      fs.readFile('tests/data/sample_cert-with-revoked-key-2.0.json', 'utf8', function (err, data) {
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function(err, data) {
          assert.isOk(err);
          expect(data).to.equal("Transaction occurred at time when issuing address was not considered valid.");
          done();
        });
      });
    });

    it("ensures a v2 certificate with a v1 issuer passes", function(done) {
      // In other words, transaction happened after issuing key was revoked
      this.timeout(10000);
      fs.readFile('tests/data/sample_cert-with_v1_issuer-2.0.json', 'utf8', function (err, data) {
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function(err, data) {
          assert.isNotOk(err);
          assert.isOk(data);
          done();
        });
      });
    });

    it("ensures an expired v2 certificate fails", function(done) {
      this.timeout(3000);
      fs.readFile('tests/data/sample_cert-expired-2.0.json', 'utf8', function (err, data) {
        if (err) {
          assert.fail();
          done(err);
        }
        var certVerifier = new CertificateVerifier(data);
        // This just checks the expiration date since the certificate was modified to expire it. We should issue an
        // expires certificate as well for an end-to-end test case.
        certVerifier._checkExpiryDate(function(err, data) {
          assert.isOk(err);
          expect(data).to.contain("expired");
          done();
        });
      });
    });
  });

});