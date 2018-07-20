import { BLOCKCHAINS } from '../../../constants/blockchains';
import addresses from '../../addresses';

/**
 * getChain
 *
 * Returns a chain object by looking at the signature value or the bitcoin address (legacy)
 *
 * @param signature
 * @param bitcoinAddress
 * @returns {*}
 */
export default function getChain (bitcoinAddress, signature = null) {
  if (signature == null) {
    // Legacy path: we didn't support anything other than testnet and mainnet, so we check the address prefix
    // otherwise try to determine the chain from a bitcoin address
    return addresses.isMainnet(bitcoinAddress) ? BLOCKCHAINS.bitcoin : BLOCKCHAINS.testnet;
  } else {
    let cleanedSignature = signature || {};
    if (cleanedSignature.anchors) {
      let anchors = cleanedSignature.anchors;
      let anchor = anchors[0];
      let signature = anchor.chain;
      // TODO put in a separate function (did this way for now since I couldn't find a way to test a private function with Jest, and it's getting late)
      let chainObject = Object.entries(BLOCKCHAINS).find(entry => entry[1].signatureValue === signature);
      if (typeof chainObject === 'undefined') {
        throw new Error('Didn\'t recognize chain value');
      }
      return chainObject[1];
    }
  }
}
