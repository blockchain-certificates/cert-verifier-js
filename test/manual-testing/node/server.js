/* eslint @typescript-eslint/no-require-imports: 0 */

const express = require('express');
const bodyParser = require('body-parser');
const certVerifierJs = require('../../../dist/verifier-node');
const { FakeFetch } = require('../../build/mocks/FakeFetch.cjs');

const server = express();
server.use(bodyParser.json({ limit: '5mb' }));

const port = 4000;

server.post('/verification', async (req, res) => {
  if (req.body.useMockInternet) {
    console.warn('Bypassing any internet requests');
    global.fetch = FakeFetch;
  }
  if (req.body.blockcerts) {
    try {
      const blockcertsData = req.body.blockcerts;
      const certificate = new certVerifierJs.Certificate(blockcertsData);
      await certificate.init();
      const { status, message } = await certificate.verify();

      console.log(`${req.body.version} Status:`, status);

      if (status === 'failure') {
        console.log(`The certificate ${req.body.blockcerts.id} is not valid. Error: ${message}`);
      }

      return res.json({ version: req.body.version, status, message });
    } catch (err) {
      console.error(req.body.version, err);
      return res.status(500).json({ version: req.body.version, status: 'failure', message: err.message });
    }
  }
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
