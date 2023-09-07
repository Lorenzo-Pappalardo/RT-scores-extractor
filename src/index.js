import puppeteer from 'puppeteer';
import { catalog } from './catalog.js';
import { writeFileSync } from 'fs';

(async () => {
  async function extractScores(page, title) {
    try {
      console.log(title);

      await page.type('.search-text', title);

      // Wait and click on first result
      const searchResultSelector = 'a[data-qa=search-results-link]';
      await page.waitForSelector(searchResultSelector);

      await page.click(searchResultSelector);

      const scoreBoardSelector = 'score-board';
      await page.waitForSelector(scoreBoardSelector);

      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      return await page.evaluate(() => {
        const scoreBoardSelector = 'score-board';
        const scoreBoard = document.querySelector(scoreBoardSelector);

        const tomatometer = scoreBoard.shadowRoot
          .querySelector('score-icon-critic')
          .shadowRoot.querySelector('span.percentage').textContent;

        const audienceScore = scoreBoard.shadowRoot
          .querySelector('score-icon-audience')
          .shadowRoot.querySelector('span.percentage').textContent;

        console.log(tomatometer);
        console.log(audienceScore);

        return [tomatometer, audienceScore];
      });
    } catch (error) {
      console.error(title, error);
    }
  }

  try {
    const rottenTomatoesUrl = 'https://rottentomatoes.com/';

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto(rottenTomatoesUrl);

    const rejectAllButtonSelector = '#onetrust-reject-all-handler';
    await page.waitForSelector(rejectAllButtonSelector);
    await page.click(rejectAllButtonSelector);

    const results = [];

    for (const title of catalog) {
      const result = JSON.stringify({
        title,
        scores: await extractScores(page, title)
      });

      writeFileSync('./results.txt', `${JSON.stringify(result)}\n`, {
        flag: 'a'
      });
    }
  } catch (e) {
    console.error(e);
  }
})();
