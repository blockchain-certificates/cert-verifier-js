import v2IssuerProfile from '../../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RevocationList from '../../assertions/v2-revocation-list';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../assertions/v3.0-issuer-profile.json';
import v3RevocationList from '../../assertions/v3-revocation-list';

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
      case 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json':
        return JSON.stringify(v2IssuerProfile);

      case 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39':
        return JSON.stringify(v2RevocationList);

      case `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`:
        return JSON.stringify({ didDocument });

      case 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json':
        return JSON.stringify(fixtureIssuerProfile);

      case 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json':
        return JSON.stringify(v3RevocationList);

      case 'https://blockstream.info/api/tx/2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd':
        return JSON.stringify({
          vout: [
            {
              // hash
              scriptpubkey: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8'
            }
          ],
          vin: [
            {
              prevout: {
                // issuing adress
                scriptpubkey_address: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
              }
            }
          ],
          status: {
            confirmed: true,
            block_time: new Date('2018-02-08T00:23:34.000Z').getTime() / 1000
          }
        });

      case 'https://blockstream.info/testnet/api/tx/140ee9382a5c84433b9c89a5d9fea26c47415838b5841deb0c36a8a4b9121f2e':
        return JSON.stringify({
          vout: [
            {
              // hash
              scriptpubkey: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6'
            }
          ],
          vin: [
            {
              prevout: {
                // issuing adress
                scriptpubkey_address: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am'
              }
            }
          ],
          status: {
            confirmed: true,
            block_time: new Date('2022-04-05T18:45:30.000Z').getTime() / 1000
          }
        });
    }
  }
}
