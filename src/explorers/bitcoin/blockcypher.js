import { request } from '../../services';
import { dateToUnixTimestamp } from '../../helpers/date';
import { API_URLS, BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { stripHashPrefix } from './../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';

export function getBlockcypherFetcher (transactionId, chain) {
  let blockCypherUrl;
  if (chain === BLOCKCHAINS.bitcoin.code) {
    blockCypherUrl = API_URLS.blockCypherUrl + transactionId + '?limit=500';
  } else {
    blockCypherUrl = API_URLS.blockCypherTestUrl + transactionId + '?limit=500';
  }
  let blockcypherFetcher = new Promise((resolve, reject) => {
    return request({ url: blockCypherUrl })
      .then(function (response) {
        const responseData = JSON.parse(response);
        try {
          const txData = parseBlockCypherResponse(responseData);
          resolve(txData);
        } catch (err) {
          // don't need to wrap this exception
          reject(err.message);
        }
      })
      .catch(function () {
        reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'getBlockcypherFetcher')));
      });
  });
  return blockcypherFetcher;
}

function parseBlockCypherResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }
  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
