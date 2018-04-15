'use strict';

import "babel-polyfill";
import { assert, expect } from 'chai'
import { Blockchain, Certificate } from '../lib/index'
import {readFileAsync} from '../lib/promisifiedRequests'

describe('Certificate parsing', async () => {
  describe('parse v2', async () => {
    it('parses a v2 certificate', async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.name).to.equal('Eularia Landroth');
        expect(cert.chain).to.equal(Blockchain.testnet);
      } catch (err) {
        assert.fail('This test should pass')
      }
    });
  });

  describe('parse v1', async () => {
    it('parses a v1 certificate', async () => {

      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-1.2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.name).to.equal('Arya Stark');
        expect(cert.signature).to.equal('H0osFKllW8LrBhNMc4gC0TbRU0OK9Qgpebji1PgmNsgtSKCLXHL217cEG3FoHkaF/G2woGaoKDV/MrmpROvD860=');
      } catch (err) {
        assert.fail('This test should pass')
      }
    });
  });

});