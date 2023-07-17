import fs from 'fs';

export async function readFileAsync (path: string): Promise<any> {
  return await readFile(path);
}

export async function readFile (path: string): Promise<any> {
  return await new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf8', function (err, data): void {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
