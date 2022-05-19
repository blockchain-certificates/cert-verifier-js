module.exports = {
  modulePaths: [
    '<rootDir>/src/',
    '<rootDir>/node_modules'
  ],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
    '^.+\\.(js)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@digitalbazaar|@blockcerts)/)'
  ]
};
