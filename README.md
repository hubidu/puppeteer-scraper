# puppetry

Implement crawlers using a sane api on top of codeceptjs and puppeteer.

## Example

scripts/check24/login.js

```js
module.exports = async function GotoCHECK24Main(ctx, I) {
  await I.amOnPage('https://www.check24.de');
  await I.wait(2);
};
```

```js
    const runScript = require('./runner');
    const scriptFn = require('./scripts/check/login');

    async function() {
        await runScript(scriptFn, './_out', {});
    }()
```



