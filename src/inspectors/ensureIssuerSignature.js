import { BLOCKCHAINS } from '../constants';
import bitcoin from 'bitcoinjs-lib';
import VerifierError from '../models/verifierError';
import { getText } from '../domain/i18n/useCases';

export default function ensureIssuerSignature (
  issuerKey,
  certificateUid,
  certificateSignature,
  chain
) {
  const bitcoinChain =
    chain === BLOCKCHAINS.bitcoin.code
      ? bitcoin.networks.bitcoin
      : bitcoin.networks.testnet;
  if (
    !bitcoin.message.verify(
      issuerKey,
      certificateSignature,
      certificateUid,
      bitcoinChain
    )
  ) {
    throw new VerifierError(getText('errors', 'ensureIssuerSignature'));
  }
}
