import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_APIS } from '../../constants';
import { request } from '../../services/request';
import { TransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { buildTransactionApiUrl } from '../../services/transaction-apis';
import { stripHashPrefix } from '../utils/stripHashPrefix';

export async function getBitpayTransaction (transactionId) {
  const requestUrl = buildTransactionApiUrl(TRANSACTION_APIS.Bitpay, transactionId);
  let response = await request({ url: requestUrl }).catch(() => {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'unableToGetRemoteHash'));
  });

  try {
    const jsonResponse = JSON.parse(response);
    return generateTransactionDataFromBitpayResponse(jsonResponse);
  } catch (err) {
    throw new Error(err.message);
  }
}

function generateTransactionDataFromBitpayResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBitpayResponse'));
  }
  const time = jsonResponse.blocktime;
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.vout[0].scriptPubKey.addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.scriptPubKey.hex, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spentTxId)
    .map(output => output.scriptPubKey.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
