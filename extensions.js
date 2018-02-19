const debug = require('debug')('extensions');
const path = require('path');
const mkdirp = require('mkdirp');

const extensions = {
  async downloadTo(documentUrl, destDir) {
    function saveFile(fileName, buffer) {
      const fs = require('fs'); // eslint-disable-line
      return new Promise((resolve, reject) => {
        fs.writeFile(fileName, buffer, function (err) { // eslint-disable-line
          if (err) return reject(err);
          return resolve();
        });
      });
    }

    function getFileName(val) {
      if (!val) return undefined;

      const matches = val.match(/filename="(.*)"/);
      if (!matches) return undefined;

      return matches[1];
    }

    const downloadWithXHR = async url => {
      const xhrSend = xhr =>
        new Promise((resolve, reject) => {
          xhr.onload = (e) => { // eslint-disable-line
            if (xhr.readyState === 4) {
              resolve(e);
            }
          };
          xhr.onerror = (e) =>{ reject(e); }; // eslint-disable-line
          xhr.send();
        });

      const xhr = new XMLHttpRequest(); // eslint-disable-line
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';

      await xhrSend(xhr);

      return {
        status: xhr.status,
        bytes: Array.from(new Uint8Array(xhr.response)),
        fileName: xhr.getResponseHeader('content-disposition'),
        headers: xhr.getAllResponseHeaders(),
      };
    };

    const resp = await this.page.evaluate(downloadWithXHR, documentUrl);
    resp.buffer = new Buffer(resp.bytes);
    if (resp.fileName) {
      resp.fileName = getFileName(resp.fileName);
    }

    mkdirp.sync(destDir);

    resp.path = path.join(destDir, resp.fileName);

    debug('Saving file', resp.path);
    await saveFile(`${resp.path}`, resp.buffer);

    return resp;
  },

  async waitForIdle() {
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' }); // that should be in codeceptjs
  },
};

module.exports = extensions;
