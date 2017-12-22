'use strict';

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
import fs from 'fs';
import debug from 'debug';
import {VerifierError} from '../config/default';

const log = debug("promisifiedRequests");



export function request(obj) {
  return new Promise((resolve, reject) => {
    let url = obj.url;
    let request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText);
      } else {
        let failureMessage = `Error fetching url:${url}; status code:${request.status}`;
        log(failureMessage);
        reject(new VerifierError(failureMessage));
      }
    });
    request.addEventListener('error', () => {
      log(`Request failed with error ${request.responseText}`);
      reject(new VerifierError(request.responseText));
    });

    request.open(obj.method || "GET", url);
    request.responseType = "json";
    if (obj.body) {
      request.send(JSON.stringify(obj.body));
    } else {
      request.send();
    }
  });
};

export async function readFileAsync(path) {
  return await readFile(path);
}

export function readFile(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}


