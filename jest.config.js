module.exports = {
  modulePaths: [
    '<rootDir>/src/',
    '<rootDir>/node_modules',
    '<rootDir>/dist'
  ],
  transform: {
    '^.+\\.((j|t)s)$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@digitalbazaar|@blockcerts|base58-universal|base64url-universal|crypto-ld|ky-universal|node-fetch)/)'
  ]
};
