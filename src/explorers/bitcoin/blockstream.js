import { BLOCKCHAINS, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { generateTransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { timestampToDateObject } from '../../helpers/date';

function parsingTransactionDataFunction (jsonResponse) {
  if (!jsonResponse.status.confirmed) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockstreamResponse'));
  }
  const time = timestampToDateObject(jsonResponse.status.block_time);
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.vout[0].scriptpubkey_address;
  const opReturnScript = stripHashPrefix(lastOutput.scriptpubkey, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.scriptpubkey_address)
    .map(output => output.scriptpubkey_address);
  return generateTransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}

const serviceUrls = {
  main: `https://blockstream.info/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
  test: `https://blockstream.info/testnet/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
};

export {
  serviceUrls,
  parsingTransactionDataFunction
};
