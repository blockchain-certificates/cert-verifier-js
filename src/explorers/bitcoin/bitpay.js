import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { timestampToDateObject } from '../../helpers/date';

function parsingTransactionDataFunction (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBitpayResponse'));
  }
  const time = timestampToDateObject(jsonResponse.blocktime);
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

const serviceUrls = {
  main: `https://insight.bitpay.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
  test: `https://api.bitcore.io/api/BTC/testnet/tx/${TRANSACTION_ID_PLACEHOLDER}`
};

export {
  serviceUrls,
  parsingTransactionDataFunction
};
