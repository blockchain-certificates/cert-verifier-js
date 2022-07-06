const express = require('express');
const bodyParser = require('body-parser');
const certVerifierJs = require('../../../dist/verifier-node');

const server = express();
server.use(bodyParser.json({ limit: '5mb' }));

const port = 4000;

server.post('/verification', async (req, res) => {
  if (req.body.blockcerts) {
    const blockcertsData = req.body.blockcerts;
    const certificate = new certVerifierJs.Certificate(blockcertsData);
    await certificate.init();
    await certificate
      .verify()
      .then(({ status, message }) => {
        console.log(`${req.body.version} Status:`, status);

        if (status === 'failure') {
          console.log(`The certificate ${req.body.blockcerts.id} is not valid. Error: ${message}`);
        }

        return res.json({
          version: req.body.version,
          status,
          message
        });
      })
      .catch(err => {
        console.log(req.body.version, err);
        return err;
      });
  }
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
