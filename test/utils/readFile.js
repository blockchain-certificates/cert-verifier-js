import fs from 'fs';

export async function readFileAsync (path) {
  return readFile(path);
}

export function readFile (path) {
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
