import { startsWith } from '../../../helpers/string.js';
import CONFIG from '../../../constants/config.js';

export default function isMainnet (bitcoinAddress: string): boolean {
  return startsWith(bitcoinAddress, '1') || startsWith(bitcoinAddress, CONFIG.PublicKey);
}
