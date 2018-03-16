const runner = require('puppeteer-scrapy')


async function GotoCheck24(ctx, I) {
    await I.resizeWindow(1200, 800)

    await I.amOnPage('https://jobs.check24.de/')
    await I.fillField('#search', 'nodejs')
    await I.click('Job finden')
    await I.waitForNavigation()
    await I.waitInUrl('/search')
    
    await I.seeElement('.vacancies--section')
    const jobsHtml = await I.grabHTMLFrom('.vacancies--section')
    console.log(jobsHtml)
    return jobsHtml
}

(async function() {
    /**
     * Run the web scraping tast implemented in the async function above
     * and pass an output directory and (optionally) additional context data
     */
    const ctx = {}
    const outputDir = './check24'

    await runner(GotoCheck24, outputDir, ctx)
})();
