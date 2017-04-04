/**
 * Created by esangalang on 3/1/17.
 */

'use strict';

let cfg = {
  ssl: true, // optional, default: false
  verbose: false, // optional, default: false
  request: { // optional, request.js options, see: https://github.com/request/request#requestoptions-callback
    timeout: 20000 // 20s is the dafault value
  }
};

module.exports = (keyname, key, host, timeout) => {
  if (keyname === undefined) {
    throw new Error('Key name cannot be undefined.');
  }
  if (key === undefined) {
    throw new Error('Key cannot be undefined.');
  }
  if (host === undefined) {
    throw new Error('Host cannot be undefined.')
  }
  cfg.keyName = keyname;
  cfg.key = key;
  cfg.host = host;
  if (timeout !== undefined) {
    cfg.request.timeout = parseInt(timeout, 10);
  }
  return cfg;
}