
## Browserifying

    browserify lib/certificate.js --s Certificate -o dist/bundleCertificate.js -t [ babelify --presets [ es2015 ] ]

    browserify lib/certificateVersion.js --s CertificateVersion -o dist/bundleCertificateVersion.js -t [ babelify --presets [ es2015 ] ]

    browserify lib/status.js --s Status -o dist/bundleStatus.js -t [ babelify --presets [ es2015 ] ]

    browserify lib/verifier.js --s CertificateVerifier -o dist/bundleVerifier.js -t [ babelify --presets [ es2015 ] ]



