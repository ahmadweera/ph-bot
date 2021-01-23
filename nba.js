require('dotenv').config();

/**
 * Imports
 */
const moment = require('moment-timezone');
const puppeteer = require('puppeteer')
const user_date_format = 'MMM Do YYYY';

module.exports = {
    GetGamesForDate: async function (arg) {
        await ScreenshotScores();

        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            return `Games for ${date.format(user_date_format)}`;
        } 

        return 'Invalid Date';
    }
}

async function ScreenshotScores() {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-extensions-except=/path/to/manifest/folder/',
                '--load-extension=/path/to/manifest/folder/',
            ]
        });
        const page = await browser.newPage();
        await page.goto('https://ca.global.nba.com/scores/');

        await page.waitForSelector('#onetrust-accept-btn-handler');
        await page.click('#onetrust-accept-btn-handler');

        page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
        });

        await page.waitForTimeout(1000);

        await page.waitForSelector('#main-container > div > div.col-xl-8.col-lg-12.content-container > div.content > section > div > div > div.col-sm-12');
        const element = await page.$('#main-container > div > div.col-xl-8.col-lg-12.content-container > div.content > section > div > div > div.col-sm-12');

        await element.screenshot({ path: 'screenshots/scores.png' });
        await page.close();
        await browser.close();
    })();
}
