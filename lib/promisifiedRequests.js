'use strict';

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
import debug from 'debug';

const log = debug('promisifiedRequests');

export function request(obj) {
  return new Promise((resolve, reject) => {
    let url = obj.url;
    let request = new XMLHttpRequest();

    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText);
      } else {
        let failureMessage = `Error fetching url:${url}; status code:${request.status}`;
        reject(new Error(failureMessage));
      }
    });
    request.ontimeout = (e) => {
      console.log('ontimeout', e);
    };
    request.onreadystatechange = () => {
      if (request.status === 404) {
        reject(new Error(`Error fetching url:${url}; status code:${request.status}`));
      }
    };
    request.addEventListener('error', () => {
      log(`Request failed with error ${request.responseText}`);
      reject(new Error(request.responseText));
    });

    request.responseType = 'json';
    request.open(obj.method || 'GET', url);

    if (obj.body) {
      request.send(JSON.stringify(obj.body));
    } else {
      request.send();
    }
  });
}
