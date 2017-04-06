
## Browserifying


    browserify lib/verifier.js --s CertificateVerifier -o bundleVerifier.js -t [ babelify --presets [ es2015 ] ]

    browserify lib/status.js --s Status -o bundleStatus.js -t [ babelify --presets [ es2015 ] ]

    browserify lib/certificate.js --s Certificate -o bundleCertificate.js -t [ babelify --presets [ es2015 ] ]

