import v1IssuerProfile from '../../fixtures/v1/got-issuer_live.json';

// after editing run npm run transpile:mocks:iife
export class FakeXmlHttpRequest {
  open (method, url) {
    this.url = url;
  }

  send () {
    this.status = 200;
    this.responseText = this.getMockResponseText();
    this.onload();
  }

  onload () {}

  setRequestHeader () {}

  getMockResponseText () {
    switch (this.url) {
      case 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json':
      case 'https://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json':
        return JSON.stringify(v1IssuerProfile);

      case 'https://blockstream.info/api/tx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d':
      case 'https://blockstream.info/testnet/api/tx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d':
        return JSON.stringify({
          vout: [
            {
              // hash
              scriptpubkey: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728'
            }
          ],
          vin: [
            {
              prevout: {
                // issuing adress
                scriptpubkey_address: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619'
              }
            }
          ],
          status: {
            confirmed: true,
            block_time: 1475524375
          }
        });

      case 'https://api.blockcypher.com/v1/btc/main/txs/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d?limit=500':
      case 'https://api.blockcypher.com/v1/btc/test3/txs/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d?limit=500':
        return JSON.stringify({
          block_hash: '000000000000000000b678d75eef4234cb04cea4f6324830e7d11ca99aa2f326',
          block_height: 432702,
          block_index: 2491,
          hash: '8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d',
          addresses: [
            '16wyA4kLFiaQSEE9xZEFTEMXTzWsGf4Zki',
            '18AaFyeWmsasbSh2GsjGTtrNHqiJgsN6nB',
            '1AAGG6jirbu9XwikFpkHokbbiYpjVtFe1G',
            '1K4P4LKXWZZ5bS2i34zLaJkHxbFBreDoTa',
            '1PrmJ6pGbfe4ucNCVbe4tbXRRHMsDDSxvY',
            '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619'
          ],
          total: 46961,
          fees: 17633,
          size: 404,
          vsize: 404,
          preference: 'low',
          confirmed: '2016-10-03T19:52:55Z',
          received: '2016-10-03T19:52:55Z',
          ver: 1,
          double_spend: false,
          vin_sz: 1,
          vout_sz: 7,
          data_protocol: 'unknown',
          confirmations: 384337,
          confidence: 1,
          inputs: [
            {
              prev_hash: '33f1dec9e866861b88d81f5e9d9ffc20549dc5a9f2003f2f66c94b23239137ce',
              output_index: 0,
              script: '473044022032d2d9c2a67d90eb5ea32d9a5e935b46080d4c62a1d53265555c78775e8f6f2102205c3469593995b9b76f8d24aa4285a50b72ca71661ca021cd219883f1a8f14abe012103704cf7aa5e4152639617d0b3f8bcd302e231bbda13b468cba1b12aa7be14f3b3',
              output_value: 64594,
              sequence: 4294967295,
              addresses: [
                '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619'
              ],
              script_type: 'pay-to-pubkey-hash',
              age: 432700
            }
          ],
          outputs: [
            {
              value: 2750,
              script: '76a91464799d48941b0fbfdb4a7ee6340840fb2eb5c2c388ac',
              spent_by: 'c2216d6e4ce6d32e16b0504f5268213231f982050abdc81c9496e729d07e445e',
              addresses: [
                '1AAGG6jirbu9XwikFpkHokbbiYpjVtFe1G'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 2750,
              script: '76a914c615ecb52f6e877df0621f4b36bdb25410ec22c388ac',
              spent_by: 'c2216d6e4ce6d32e16b0504f5268213231f982050abdc81c9496e729d07e445e',
              addresses: [
                '1K4P4LKXWZZ5bS2i34zLaJkHxbFBreDoTa'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 2750,
              script: '76a9144e9862ff1c4041b7d083fe30cf5f68f7bedb321b88ac',
              spent_by: 'c2216d6e4ce6d32e16b0504f5268213231f982050abdc81c9496e729d07e445e',
              addresses: [
                '18AaFyeWmsasbSh2GsjGTtrNHqiJgsN6nB'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 2750,
              script: '76a914413df7bf4a41f2e8a1366fcf7352885e6c88964b88ac',
              spent_by: 'c2216d6e4ce6d32e16b0504f5268213231f982050abdc81c9496e729d07e445e',
              addresses: [
                '16wyA4kLFiaQSEE9xZEFTEMXTzWsGf4Zki'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 2750,
              script: '76a914fabc1ff527531581b4a4c58f13bd088e274122bc88ac',
              spent_by: 'c2216d6e4ce6d32e16b0504f5268213231f982050abdc81c9496e729d07e445e',
              addresses: [
                '1PrmJ6pGbfe4ucNCVbe4tbXRRHMsDDSxvY'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 33211,
              script: '76a914fcbe34aa288a91eab1f0fe93353997ec6aa3594088ac',
              spent_by: '562ecb35036a8e076a500a43c84bffbf185747d40dfd55f66694d6f7f9314cfd',
              addresses: [
                '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619'
              ],
              script_type: 'pay-to-pubkey-hash'
            },
            {
              value: 0,
              script: '6a2068f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
              addresses: null,
              script_type: 'null-data',
              data_hex: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728'
            }
          ]
        });

      default:
        console.warn('No fake response was set for url', this.url);
    }
  }
}
