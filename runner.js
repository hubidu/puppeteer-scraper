const withBrowser = require('../puppetry/with-browser');

module.exports = async (scriptFn, outputDir, ctx) => withBrowser({
  dir: outputDir,
  show: process.env.NODE_ENV === undefined, // show browser window on development
  ctx,
}, scriptFn);
