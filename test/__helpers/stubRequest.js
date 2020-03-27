import sinon from 'sinon';
import * as request from '../../src/services/request';

export default function stubRequest (url, expectedResponse) {
  if (!url) {
    throw new Error('No url passed to mock output. Make sure you pass the calling url.');
  }

  if (!expectedResponse) {
    throw new Error('No response passed to mock output. Make sure you pass the expected version response.');
  }

  let lookForTxStub;

  beforeEach(function () {
    lookForTxStub = sinon.stub(request, 'request').withArgs({ url }).resolves(JSON.stringify(expectedResponse));
    lookForTxStub.callThrough();
    global.lookForTxStub = lookForTxStub;
  });

  afterEach(function () {
    lookForTxStub.restore();
  });
}
