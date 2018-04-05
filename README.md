# puppeteer-scraper

Implement scrapers with a sane api. Thanks to codeceptjs and puppeteer.

## Use it in your project

```js
  npm install puppeteer-scrapy --save
```

## Examples

There is a simple example in the examples subdirectory. To run it:

Switch to the example directory and run

```js
  npm install
```

Then run the script

```js
  node check24.js
```

You can turn on debug output in crawl scripts with

```js
  DEBUG=run-script node check24.js
```

You will see a detailed list of executed commands like so

```bash
  run-script                          /local-ntp.html    I.RESIZEWINDOW (1200 ,800) +0ms
  run-script                                        /    I.WAIT (0) +2s
  run-script                                        /    I.AMONPAGE (https://jobs.check24.de/) +2ms
  run-script                                        /    I.WAIT (0) +1s
  run-script                                        /    I.FILLFIELD (#search ,nodejs) +1ms
  run-script                                        /    I.WAIT (0) +8ms
  run-script                                        /    I.PRESSKEY (Enter) +0ms
  run-script                                 /search/    I.WAIT (1) +2s
  run-script                                 /search/    I.WAITFORNAVIGATION () +4ms
  run-script                                 /search/    I.WAITINURL (/search) +18ms
  run-script AUTOWAIT .vacancies--section +4ms
  run-script                                 /search/    I.SEEELEMENT (.vacancies--section) +505ms
  run-script                                 /search/    I.GRABHTMLFROM (.vacancies--section) +375ms
```

Besides the output directory will contain a number of screenshots of the websites' state at various points during
the script execution.



