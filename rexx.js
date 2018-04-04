const runner = require('./runner')
const cheerio = require('cheerio')

async function getChildFrames(frame) {
    const childFrames = await frame.childFrames()
    console.log('Child frames')
    for (const c of childFrames) {
        console.log(await c.name())
    }
    return childFrames
}

function dumpFrameTree(frame, indent) {
    console.log(indent + frame.url());
    for (let child of frame.childFrames())
      dumpFrameTree(child, indent + '  ');
}

async function LoginTask(I) {
    await I.resizeWindow(1200, 800)

    await I.amOnPage('https://check24.rexx-recruitment.com')
    await I.fillField('username', 'stefan.huber')
    await I.fillField('passwort', 'MyRexxPassword#')
    await I.clickAndNavigate('Login')
}

async function openProfile(ctx, I) {
    await I.perform(LoginTask)

    await I.click('.fa.fa-search')
    await I.fillField('#global_search_key', ctx.name)
    await I.wait(1)
    await I.click('.ac_results ul > li')
    await I.wait(2)

    await I.switchTo('#Unten')

    await I.wait(2)

    // dumpFrameTree(I.page.mainFrame(), ' ')

    // console.log(await I.page.mainFrame().$$('#cf_gehaltswunsch'))
    console.log(await I.page.mainFrame().childFrames()[0].content())
    console.log(await I.grabHTMLFrom('#cf_gehaltswunsch'))
    // console.log(await I.grabHTMLFrom('#cat_applicant_file_1'))

    // const frames = await I.page.frames()

    // const mainFrame = await frames[1]
    // console.log(await mainFrame.name())
    // console.log(await (await mainFrame.$('sdf')).jsonValue())
    // const results = {}
    // const attrs = ['cf_gehaltswunsch', 'cf_fullname', 'mail', 'handy', 'eintrittsdatum']
    // for (const attr of attrs) {
    //     results[attr] = await mainFrame.$(`#${attr}`)
    // }

    // console.log(results)
}


const listNewCandidates = async (ctx, I) => {
    await I.perform(LoginTask)

    await I.click('#menu_513_item')
    await I.wait(2)

    // await I.switchTo('#Unten')
    // await I.switchTo('#widgetcontactcenter_iframe')

    // dumpFrameTree(I.page.mainFrame(), '   ')


    const html = await I.page.mainFrame().childFrames()[0].childFrames()[2].content()
    const $ = cheerio.load(html)
    
    $('.grid_table a').each(function (i, el) {
        if ($(el).text() === 'PDF-Akte') {
            console.log($(el).attr('href'))
        }
    })

    await I.wait(5)
}

(async function() {
    await runner(listNewCandidates, './open-profile', { name: 'alee kazmi' })

})();
