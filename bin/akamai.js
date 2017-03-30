#!/usr/bin/env node

/**
 * Created by phantomcoder on 3/1/17.
 */

const argv = require('minimist')(process.argv.slice(2));

const akamai = require('akamai-http-api');

const fs = require('fs');

const config = require('../config/configuration');

const AkamaiReader = require('../lib/reader');
const AkamaiWriter = require('../lib/writer');

const getFromFileConfig = (cfgPath) => {
  let fileConfig = fs.readFileSync(cfgPath, 'utf8').toString();
  return JSON.parse(fileConfig);
}

let fileConfig={};

if (argv.cfg || argv.f) {
  fileConfig = getFromFileConfig(argv.cfg||argv.f);
}

const keyName = process.env.AKAMAI_KEY_NAME||argv.akamaiKeyName||argv.n||fileConfig.akamaiKeyName;
const key = process.env.AKAMAI_KEY||argv.akamaiKey||argv.k||fileConfig.akamaiKey;
const host = process.env.AKAMAI_HOST||argv.akamaiHost||argv.h||fileConfig.akamaiHost;

const accountRoot = argv.accountRoot||argv.r||'/';
const tempFolder = argv.tempFolder||argv.t||'tmp/';

let command = argv.command||argv.c||'read';

command = command.toLowerCase();

let akamaiConfig;

try {
  akamaiConfig = config(keyName, key, host);
  //console.log(akamaiConfig);
  akamai.setConfig(akamaiConfig);
} catch (err) {
  console.log('Invalid arguments.');
}

if (command === 'read') {

  let path = argv.path||argv.p||'';

  let akamaiReader = new AkamaiReader(akamai, accountRoot, tempFolder);
  akamaiReader.readDirectory(path).then(data=>{
    console.log(JSON.stringify(data));
    process.exit(0);
  }).catch(err=>{
    console.log(err);
    process.exit(-1);
  });

} else if (command === 'clean') {
  let akamaiWriter = new AkamaiWriter(akamai, accountRoot);
  let path = argv.path||argv.p||'';
  akamaiWriter.deleteItems(path).then(data => {
    console.log(data);
    process.exit(0);
  }).catch(err => {
    console.log(err);
    process.exit(-1);
  });
} else if (command === 'upload') {
  let uploadFolder = argv.uploadPath||argv.u||'./';
  let path = argv.path||argv.p||'';
  let akamaiWriter = new AkamaiWriter(akamai, accountRoot);
  akamaiWriter.uploadDirectory(uploadFolder, path).then(data => {
    console.log(data);
    process.exit(0);
  }).catch(err => {
    console.log(err);
    process.exit(-1);
  });
} else {
  console.log(akamaiConfig);
}

