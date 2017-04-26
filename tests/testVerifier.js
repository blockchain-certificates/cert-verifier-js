'use strict';
var expect    = require("chai").expect;
var assert    = require("chai").assert;
var CertificateVerifier = require("../lib/verifier");


var fs = require('fs');


describe("Certificate verifier", function() {

  describe("verify v1", function() {
    it("verifies a v1 certificate", function(done) {
      this.timeout(3000);
      fs.readFile('tests/sample_signed_cert-valid-1.2.0.json', 'utf8', function (err, data) {
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
  });

  describe("verify v2", function() {
    it("verifies a v2 certificate", function(done) {
      this.timeout(10000);
      fs.readFile('tests/sample_signed_cert-valid-2.0.json', 'utf8', function (err, data) {
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

    it("verifies a tampered v2 certificate", function(done) {
      this.timeout(10000);
      fs.readFile('tests/sample_signed_cert-unmapped-2.0.json', 'utf8', function (err, data) {
        var certVerifier = new CertificateVerifier(data);
        certVerifier.verify(function(err, data) {
          assert.isOk(err);
          done();
        });
      });

    });
  });


});