import { BLOCKCHAINS } from '../../../constants/blockchains';
import addresses from '../../addresses';
import { getText } from '../../i18n/useCases';

/**
 * getChain
 *
 * Returns a chain object by looking at the signature value or the bitcoin address (legacy)
 *
 * @param signature
 * @param address
 * @returns {*}
 */
export default function getChain (address, signature = null) {
  let cleanedSignature = signature || {};
  if (cleanedSignature.anchors) {
    let anchors = cleanedSignature.anchors;
    let anchor = anchors[0];
    if (anchor.chain) {
      let signature = anchor.chain;
      let chainObject = Object.entries(BLOCKCHAINS).find(entry => entry[1].signatureValue === signature);
      if (typeof chainObject === 'undefined') {
        throw new Error(getText('errors', 'getChain'));
      }
      return chainObject[1];
    }
  }

  // Legacy path: we didn't support anything other than testnet and mainnet, so we check the address prefix
  // otherwise try to determine the chain from a bitcoin address
  return addresses.isMainnet(address) ? BLOCKCHAINS.bitcoin : BLOCKCHAINS.testnet;
}
