/* eslint-disable no-restricted-syntax, prefer-template, no-plusplus, no-underscore-dangle */
const log = require('debug')('run-script');
const debug = require('debug')('decorator');
const { URL } = require('url');

const formatUrl = url => {
  const trunc = txt => {
    if (txt.length < 40) return txt.padStart(40);
    return txt.slice(0, 17) + '...' + txt.slice(Math.max(0, txt.length - 20));
  };

  const parsedUrl = new URL(url);

  return trunc(parsedUrl.pathname);
};


const correctStacktrace = stackOfMethod => {
  const lines = stackOfMethod.stack.split('\n');

  let i = 1;
  for (const l of lines) {
    if (l.indexOf('.wrapped')) break;
    i++;
  }

  return [lines[0]].concat(lines.slice(i + 1)).join('\n');
};

const isAction = fnName => ['click'].indexOf(fnName.toLowerCase()) > -1;

const onAfterCmd = async (actor, fn) => {
  // if (isAction(fn.name)) {
  //   debug(`[${fn.name}] waiting for navigation...`);
  //   try {
  //     await actor.page.waitForNavigation({ timeout: 5000, waitUntil: ['domcontentloaded', 'networkidle0'] });
  //   } catch (err) {
  //     console.log('WARNING Failed to wait for navigation', err);
  //   }
  //   debug(`[${fn.name}] DONE waiting for navigation`);
  // }
};

const onBeforeCmd = async (actor, fn, args) => {
  const selectorFrom = arg => {
    if (!arg) return undefined
    if (arg.indexOf('#') === 0 || arg.indexOf('.') === 0 || arg.indexOf('span') === 0 || arg.indexOf('button') === 0) {
      return arg
    }
    return undefined
  }
  const getCssSelector = (fn, args) => {
    switch (fn.name) {
      case 'click': return selectorFrom(args.length === 1 ? args[0] : args[1])
      case 'seeElement': return selectorFrom(args[0])
    }
    return undefined;
  }

  const cssSel = getCssSelector(fn, args)
  if (!cssSel) return

  log('AUTOWAIT', cssSel)
  await actor.page.waitFor(cssSel, { timeout: 5000 })
};

const formatArgs = args => {
  if (args.some(arg => typeof arg === 'string' && (arg.indexOf('login') >= 0 || arg.indexOf('password') >= 0 || arg.indexOf('pin') >= 0))) {
    return '*** CREDENTIALS ***';
  }
  return args.join(' ,');
};

const logStep = async (actor, fn, args, err) => {
  const url = await actor.page.url();
  let msg;
  if (err) {
    msg = `${formatUrl(url)} \t I.${fn.name.toUpperCase()} (${formatArgs(args)}) <=== this FAILED`;
  } else {
    msg = `${formatUrl(url)} \t I.${fn.name.toUpperCase()} (${formatArgs(args)})`;
  }

  log(msg);

  actor._report.steps.push({
    at: Date.now(),
    success: err === undefined,
    url,
    name: fn.name,
    args: fn.name === 'fillField' ? ['No args shown'] : args,
    err,
  });
};

const decoratorFn = (actor, fn) =>
  async function wrapped(...args) {
    const boundFn = fn.bind(actor);

    actor._report = actor._report || { // eslint-disable-line
      steps: [],
    };

    const stackOfMethod = new Error();

    try {
      await onBeforeCmd(actor, fn, args);

      const res = await boundFn(...args);

      logStep(actor, fn, args);

      await onAfterCmd(actor, fn, args);

      return res;
    } catch (err) {
      try {
        // TODO Use your own screenshot function to get rid of setting the global output dir
        if (process.env.DEBUG) {
          await actor.saveScreenshot(`${Date.now()}-I.${fn.name}.error.png`);
        }
      } catch (err2) {
        console.log('WARNING Failed to take screenshot', err2);
      }

      err.message = err.message || err.cliMessage();
      err.orgStack = err.stack;
      err.stack = correctStacktrace(stackOfMethod);

      logStep(actor, fn, args, err);

      throw err;
    }
  };

module.exports = decoratorFn;
