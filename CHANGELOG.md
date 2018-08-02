# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.0](https://github.com/blockchain-certificates/cert-verifier-js/releases/tag/v2.0.0) Unreleased
**Complete re-write of the API.** Please check the [examples](https://github.com/blockchain-certificates/cert-verifier-js/tree/master#examples) and [API doc](https://github.com/blockchain-certificates/cert-verifier-js/tree/master#api) for more details.
### Added
- `Certificate` class
- `Certificate.verify()` method
- `BLOCKCHAINS`, `STEPS`, `SUB_STEPS`, `CERTIFICATE_VERSIONS`, `VERIFICATION_STATUSES` constants

### Removed
- static `parseJson()` method. **BREAKING CHANGE**
- `CertificateVerifier` class. **BREAKING CHANGE**

## [1.0.1](https://github.com/blockchain-certificates/cert-verifier-js/releases/tag/v1.0.1) - 2018-06-19
### Security
- Updated dependency version to fix vulnerability issues

## [1.0.0](https://github.com/blockchain-certificates/cert-verifier-js/releases/tag/v1.0.0) - 2018-06-19
