const express = require('express');
const bodyParser = require('body-parser');
const certVerifierJs = require('../../../lib');

const server = express();
server.use(bodyParser.json({ limit: '5mb' }));

const port = 4000;

server.post('/verification', async (req, res) => {
  if (req.body.blockcerts) {
    const blockcertsData = req.body.blockcerts;
    const certificate = new certVerifierJs.Certificate(blockcertsData);
    await certificate.init();
    certificate
      .verify()
      .then(({ status, message }) => {
        console.log('Status:', status);

        if (status === 'failure') {
          console.log(`The certificate is not valid. Error: ${message}`);
        }

        return res.json({
          status,
          message
        });
      });
  }
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
