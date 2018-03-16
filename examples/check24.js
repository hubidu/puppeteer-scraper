const runner = require('puppeteer-scrapy')
const cheerio = require('cheerio')

async function GotoCheck24(ctx, I) {
    await I.resizeWindow(1200, 800)

    await I.amOnPage('https://jobs.check24.de/')
    await I.fillField('#search', 'nodejs')
    await I.pressKey('Enter')
    // await I.click('#x-sitebody > div > main > section.hero--section.header-section.section-hero.text-primary > div.hero--section-body.container.x-hero--has-carousel-navigation > div > div > form > div > div.grid-xs-col24.grid-s-col8.grid-m-col6.grid-xs-order-last > button')
    await I.waitForNavigation()
    await I.waitInUrl('/search')
    
    await I.seeElement('.vacancies--section')
    const jobsHtml = await I.grabHTMLFrom('.vacancies--section')

    const $ = cheerio.load(jobsHtml)
    const jobTitles = $('h3').text()
    
    console.log(jobTitles)
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
