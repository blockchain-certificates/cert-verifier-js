import { startsWith } from '../../../helpers/string';
import { CONFIG } from '../../../constants';

export default function isMainnet (bitcoinAddress) {
  return startsWith(bitcoinAddress, '1') || startsWith(bitcoinAddress, CONFIG.PublicKey);
}
