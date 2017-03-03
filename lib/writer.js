/**
 * Created by esangalang on 2/16/17.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const AkamaiReader = require('./reader');

const createAkamaiFolder = (akamai, filePath) => {
  return new Promise((resolve, reject) => {
    akamai.mkdir(filePath, (err, data) => {
      if (err) {
        if (err.code === 409) {
          console.log(`${filePath} has already been created. duplicate request.`);
          resolve(`Directory: "${filePath}" creationg is duplicated.`);
        } else {
          console.log(`Error creating ${filePath}.`);
          reject(err);
        }
      }
      else {
        console.log(`Created ${filePath}.`);
        resolve(`Directory: "${filePath}" has been created.`);
      }
    });
  });
};

const deleteAkamaiFolder = (akamai, filePath) => {
  return new Promise((resolve, reject) => {
    akamai.rmdir(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(`Directory: "${filePath}" has been deleted.`)
    });
  });
};

const deleteAkamaiFile = (akamai, filePath) => {
  return new Promise((resolve, reject) => {
    console.log(`del file ${filePath}`)
    akamai.delete(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(`File: "${filePath}" has been delete.`);
    });
  });
}

const clearAkamaiFolder = (akamai, reader, filePath, depth = 0) => {
  return new Promise((resolve, reject) => {
    reader.readDirectory(filePath).then((data) => {
      console.log(`Reading: ${data.stat.attribs.directory}.`)
      console.log(JSON.stringify(data));
      if (data.stat.file) {
        let promises = [];
        for (let file of data.stat.file) {
          let deletePath = path.join(filePath, '/', file.name);
          if (file.type === 'dir') {
            console.log(`Clearing folder: ${deletePath}.`)
            let passthroughDepth = depth;
            passthroughDepth++;
            promises.push(clearAkamaiFolder(akamai, reader, deletePath, passthroughDepth));
          } else {
            let deleteFile = path.join(data.stat.attribs.directory, '/', file.name);
            console.log(`Deleting file: ${deleteFile}.`)
            promises.push(deleteAkamaiFile(akamai, deleteFile));
          }
        }
        Promise.all(promises).then((data1) => {
          if (depth === 0) {
            resolve(data1);
          } else {
            console.log(`Deleting folder: ${data.stat.attribs.directory}.`)
            deleteAkamaiFolder(akamai, data.stat.attribs.directory).then((data2) => {
              resolve(data1.concat(data2));
            }).catch((err) => {
              reject(err);
            });
          }
        }).catch((err) => {
          reject(err);
        });
      } else {
        console.log(`Deleting folder no children: ${data.stat.attribs.directory}.`)
        if (filePath === '') {
          resolve(data);
        } else {
          deleteAkamaiFolder(akamai, data.stat.attribs.directory).then((data) => {
            resolve(data);
          }).catch((err) => {
            reject(err);
          })
        }
      }
    }).catch((err) => {
      reject(err);
    });
  })
}

const uploadFile = (akamai, filePath, uploadPath) => {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(filePath);
    akamai.upload(stream, uploadPath, (err, data) => {
      if (err) {
        console.log(`${uploadPath} received an error.`);
        reject(err);
      }
      else {
        resolve(`File has been uploaded to: ${uploadPath}.`)
      }
    });
  });
};

const prepareFoldersInAkamai = (akamai, fileSet) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    for (let file of fileSet) {
      if (file.isDirectory) {
        promises.push(createAkamaiFolder(akamai, file.uploadPath));
      }
    }
    Promise.all(promises).then((data) => {
      resolve(data);
    }).catch((err) => {
      reject(err);
    });
  });
}

const getFolderItems = (folder, uploadPath) => {
  let items = fs.readdirSync(folder);
  let returnItems = [];
  for(let item of items) {
    let i = {
      name: path.join(folder, '/', item),
      uploadPath: path.join(uploadPath, '/', item),
      isDirectory: fs.lstatSync(path.join(folder, '/', item)).isDirectory()
    }
    returnItems.push(i);
    if (i.isDirectory) {
      returnItems = returnItems.concat(getFolderItems(i.name, i.uploadPath));
    }
  }
  return returnItems;
};

class AkamaiWriter {

  constructor(akamai, accountFolder) {
    this.akamai = akamai;
    this.accountFolder = accountFolder;
    this.reader = new AkamaiReader(this.akamai, accountFolder);
  }

  uploadDirectory(filePath, uploadPath = '/') {
    return new Promise((resolve, reject) => {
      let newUploadPath = path.join(this.accountFolder, '/', uploadPath);
      let items = getFolderItems(filePath, newUploadPath);
      prepareFoldersInAkamai(this.akamai, items).then((data) => {
        let promises = [];
        for (let item of items) {
          if (item.isDirectory) {
            //do nothing
          } else {
            promises.push(uploadFile(this.akamai, item.name, item.uploadPath));
          }
        }
        Promise.all(promises).then((data1) => {
          resolve(data.concat(data1));
        }).catch((err1) => {
          reject(err1);
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }

  deleteItems(filePath = '/') {
    return clearAkamaiFolder(this.akamai, this.reader, filePath);
  }
}

module.exports = AkamaiWriter;