/**
 * Created by esangalang on 3/1/17.
 */

'use strict';

const fs = require('fs');
const path = require('path');

let createTempFolder = (dir) => {
  let folders = dir.split('/');
  let count = folders.length;
  count--; //remove the filename;
  let createFolder = '';
  for (let x = 0; x < count; x++) {
    createFolder = createFolder + folders[x] + '/';
    if (createFolder === './' || createFolder === '/' || createFolder === '../') continue;
    if (!fs.existsSync(createFolder)) {
      fs.mkdirSync(createFolder);
    }
  }

}

class AkamaiReader {

  constructor (akamai, accountFolder, tmpFolder = '../tmp') {
    this.akamai = akamai;
    this.temporaryFolder = tmpFolder;
    this.accountFolder = accountFolder;
  }

  readDirectory(readPath) {
    return new Promise((resolve, reject) => {
      let readFolder = path.join(this.accountFolder, readPath);
      this.akamai.dir(readFolder, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  readFile(readPath) {
    return new Promise((resolve, reject) => {
      let savePath = path.join(this.temporaryFolder, readPath);
      createTempFolder(savePath);
      let stream = fs.createWriteStream(savePath);
      let copyPath = path.join(this.accountFolder, readPath);
      this.akamai.download(copyPath, stream, (err, data) => {
        if (err) reject(err);
        else {
          resolve(data);
        }
      });
    });
  }

}

module.exports = AkamaiReader;