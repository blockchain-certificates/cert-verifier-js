import { XMLHttpRequest as xhrPolyfill } from 'xmlhttprequest';
import debug from 'debug';

const log = debug('request');

export function request (obj) {
  return new Promise((resolve, reject) => {
    const url = obj.url;

    if (!url) {
      reject(new Error('URL is missing'));
    }

    // server
    const xhr = typeof XMLHttpRequest === 'undefined' ? xhrPolyfill : XMLHttpRequest;
    /* eslint new-cap: "off" */
    const request = new xhr();

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.responseText);
      } else {
        const failureMessage = `Error fetching url:${url}; status code:${request.status}`;
        reject(new Error(failureMessage));
      }
    };

    request.ontimeout = (e) => {
      console.log('ontimeout', e);
    };

    request.onreadystatechange = () => {
      if (request.status === 404) {
        reject(new Error(`Error fetching url:${url}; status code:${request.status}`));
      }
    };

    request.onerror = () => {
      log(`Request failed with error ${request.responseText}`);
      reject(new Error(request.responseText));
    };

    request.open(obj.method || 'GET', url);

    if (obj.body) {
      request.send(JSON.stringify(obj.body));
    } else {
      request.send();
    }
  });
}
