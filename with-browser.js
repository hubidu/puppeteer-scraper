/* eslint-disable no-underscore-dangle */
const log = require('debug')('run-script');
const debug = require('debug')('with-browser');
const mkdirp = require('mkdirp');
const path = require('path');
const Puppeteer = require('codeceptjs/lib/helper/Puppeteer');

const extensions = require('./extensions');
const wrap = require('./wrap');
const decorator = require('./decorator');

const OUTPUT_BASE_DIR = './_out';

/**
 * Perform a given task function in the context of the current puppeteer instance
 * The task function must at least take an actor as the first parameter.
 * Subsequent arguments of perform will be passed on to the task function.
 *
 * @param {*} taskFn
 * @param {*} rest
 */
async function perform(taskFn, ...rest) {
  if (!typeof taskFn === 'function') throw new Error('taskFn must be a function');

  log('');
  log(`${taskFn.name} entering...`);
  const res = await taskFn(this, ...rest);
  log(`${taskFn.name} exiting`);

  return res;
}

/**
 * Execute a given async function in a chrome headless context
 * (using puppeteer https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md)
 *
 * @param {*} opts options to pass to puppeteer
 * @param {*} fn async function to be executed
 */
async function withBrowser(opts = { show: false, ctx: {} }, fn) {
  debug('Creating puppeteer instance ...');

  const defaultOptions = {
    dir: `${Date.now()}`,
    show: false,
  };
  opts = Object.assign({}, defaultOptions, opts); // eslint-disable-line

  let I = new Puppeteer({
    // windowSize: '1900x1024',
    show: opts.show,
    waitForAction: 0,
    waitForTimeout: 10000,    
    chrome: {
      ignoreHTTPSErrors: true,
      // dumpio: true,
      args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], // TODO rather use a non root user in docker and remove --no-sandbox
      // devtools: true,
    },
  });

  // Add actor extension methods (decorated)
  I = wrap(Object.assign(I, extensions), decorator);

  // Add api methods (not decorated)
  I.perform = perform.bind(I);

  debug('Created puppeteer instance', I);

  // TODO Implement a saveScreenshot function without global variable

  // Store all artifacts in a dedicated directory
  global.output_dir = path.join(OUTPUT_BASE_DIR, opts.dir);
  mkdirp.sync(global.output_dir);

  await I._beforeSuite();
  await I._before();

  // TODO Dont use global output dir
  const finalCtx = Object.assign({}, { outputDir: global.output_dir }, opts.ctx);

  let res = {};
  let success = true;
  let msg;
  const start = Date.now();
  try {
    log('');
    log(`${fn.name} Running script...`);
    log('');

    res = await fn(finalCtx, I) || {};

    const duration = (Date.now() - start) / 1000;
    log('');
    log(`${fn.name} succeeded (${duration} s)`);
    log('');
  } catch (err) {
    success = false;
    log(`${fn.name} failed with`);
    log('');
    msg = err.toString();
    console.log(err);
    log('  ', err.stack.split('\n')[1]);
    log('');
  } finally {
    debug('Closing puppeteer instance');
    // Close the chrome instance
    await I._after();
    await I._afterSuite();
  }

  const duration = (Date.now() - start) / 1000;
  const returnValue = Object.assign({
    startedAt: start,
    outputDir: finalCtx.outputDir,
    success,
    msg,
    duration,
    result: res,
    report: I._report,
  });

  return returnValue
}

module.exports = withBrowser;
