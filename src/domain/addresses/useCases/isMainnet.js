import { startsWith } from '../../../helpers/string';
import { PublicKey } from '../../../constants/config';

export default function isMainnet (bitcoinAddress) {
  return startsWith(bitcoinAddress, '1') || startsWith(bitcoinAddress, PublicKey);
}
