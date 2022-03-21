import { startsWith } from '../../../helpers/string';
import { CONFIG } from '../../../constants';

export default function isMainnet (bitcoinAddress: string): boolean {
  return startsWith(bitcoinAddress, '1') || startsWith(bitcoinAddress, CONFIG.PublicKey);
}
