require('dotenv').config();

/**
 * Imports
 */
const moment = require('moment-timezone');
const puppeteer = require('puppeteer')
const user_date_format = 'MMM Do YYYY';
const nba_date_format = 'YYYY-MM-DD';

module.exports = {
    GetGamesForDate: async function (arg) {
    
        let date = arg
            ? moment(new Date(arg))
            : moment().tz("America/Toronto");

        if (date.isValid()) {
            await ScreenshotScores(date);
            return `Games for ${date.format(user_date_format)}`;
        } 

        return 'Invalid Date';
    }
}

async function ScreenshotScores(date) {
    (async () => {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-extensions-except=/path/to/manifest/folder/',
                '--load-extension=/path/to/manifest/folder/',
            ]
        });
        const page = await browser.newPage();

        if (date) {
            console.log(date, date.format(nba_date_format));
            await page.goto(`https://ca.global.nba.com/scores/#!/${date.format(nba_date_format)}`);
        } else {
            await page.goto(`https://ca.global.nba.com/scores/`);
        }
        
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
