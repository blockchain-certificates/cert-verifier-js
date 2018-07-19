let Status = {
  getTransactionId: 'getTransactionId',
  computingLocalHash: 'computingLocalHash',
  fetchingRemoteHash: 'fetchingRemoteHash',
  gettingIssuerProfile: 'gettingIssuerProfile',
  parsingIssuerKeys: 'parsingIssuerKeys',
  comparingHashes: 'comparingHashes',
  checkingMerkleRoot: 'checkingMerkleRoot',
  checkingReceipt: 'checkingReceipt',
  checkingIssuerSignature: 'checkingIssuerSignature',
  checkingAuthenticity: 'checkingAuthenticity',
  checkingRevokedStatus: 'checkingRevokedStatus',
  checkingExpiresDate: 'checkingExpiresDate',
  mockSuccess: 'mockSuccess'
};

var verboseMessageMap = {};
verboseMessageMap[Status.getTransactionId] = 'Getting transaction ID';
verboseMessageMap[Status.computingLocalHash] = 'Computing Local Hash';
verboseMessageMap[Status.fetchingRemoteHash] = 'Fetching remote hash';
verboseMessageMap[Status.gettingIssuerProfile] = 'Getting issuer profile';
verboseMessageMap[Status.parsingIssuerKeys] = 'Parsing issuer keys';
verboseMessageMap[Status.comparingHashes] = 'Comparing Hashes';
verboseMessageMap[Status.checkingMerkleRoot] = 'Checking Merkle Root';
verboseMessageMap[Status.checkingReceipt] = 'Checking Receipt';
verboseMessageMap[Status.checkingIssuerSignature] = 'Checking Issuer Signature';
verboseMessageMap[Status.checkingAuthenticity] = 'Checking Authenticity';
verboseMessageMap[Status.checkingRevokedStatus] = 'Checking Revoked Status';
verboseMessageMap[Status.checkingExpiresDate] = 'Checking Expires Date';
verboseMessageMap[Status.success] = 'Success';
verboseMessageMap[Status.failure] = 'Failure';
verboseMessageMap[Status.starting] = 'Starting';
verboseMessageMap[Status.mockSuccess] = 'mockSuccess';
verboseMessageMap[Status.final] = 'Final';

let getVerboseMessage = function (status) {
  return verboseMessageMap[status];
};

export {
  Status,
  getVerboseMessage
};
