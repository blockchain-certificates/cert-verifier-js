import { XMLHttpRequest as xhrPolyfill } from 'xmlhttprequest';
import debug from 'debug';

const log = debug('request');

function handleError (error) {
  const errorMessage = 'errors.invalidBlockcertsUrl';
  console.error(error);
  return {
    certificateDefinition: null,
    errorMessage
  };
}

export function request (obj) {
  return new Promise((resolve, reject) => {
    const url = obj.url;

    console.log('call with');

    if (!url) {
      reject(new Error('URL is missing'));
    }

    return fetch(url)
      .then(res => res.text())
      .then(text => {
        resolve(text);
      })
      .catch(handleError);
  });

    // server
    // const xhr = typeof XMLHttpRequest === 'undefined' ? xhrPolyfill : XMLHttpRequest;
    // /* eslint new-cap: "off" */
    // const request = new xhr();
    //
    // request.onload = () => {
    //   console.log(request.status);
    //   if (request.status >= 200 && request.status < 300) {
    //     resolve(request.responseText);
    //   } else {
    //     const failureMessage = `Error fetching url:${url}; status code:${request.status}`;
    //     reject(new Error(failureMessage));
    //   }
    // };
    //
    // request.ontimeout = (e) => {
    //   console.log('ontimeout', e);
    // };
    //
    // request.onreadystatechange = () => {
    //   if (request.status === 404) {
    //     reject(new Error(`Error fetching url:${url}; status code:${request.status}`));
    //   }
    // };
    //
    // request.onerror = () => {
    //   console.log(request);
    //   log(`Request failed with error ${request.responseText}`);
    //   reject(new Error(request.responseText));
    // };
    //
    // request.open(obj.method || 'GET', url);
    //
    // if (obj.body) {
    //   request.send(JSON.stringify(obj.body));
    // } else {
    //   request.send();
    // }
  // });
}
