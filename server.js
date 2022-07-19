const puppeteer = require('puppeteer');
require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');

const app = express()

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const { port } = process.env;

let browser;
let page;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/capital-one/sign-in', async (req, res) => {

  const { body: { username, password } } = req

  await page.goto('https://verified.capitalone.com/auth/signin', { waitUntil: 'networkidle0' }); // wait until page load
 
  await page.type('input[data-controlname="username"]', username);
  await page.type('input[data-controlname="password"]', password);

  // click and wait for navigation
  await Promise.all([
    page.click('.sign-in-button'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  res.send("Success");
});

app.get('/capital-one/transactions', async (req, res) => {
  await Promise.all([
    page.click('#viewMore'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);

  let paused = true;
  let pausedRequests = [];

  const nextRequest = () => { // continue the next request or "unpause"
      if (pausedRequests.length === 0) {
          paused = false;
      } else {
          // continue first request in "queue"
          (pausedRequests.shift())(); // calls the request.continue function
      }
  };

  await page.setRequestInterception(true);
  page.on('request', request => {

    if (["stylesheet", "script", "ping", "webp", "image"].includes(request.resourceType())) {
      request.abort();
      return;
    }

    console.log(request.resourceType())

    if (paused) {
        pausedRequests.push(() => request.continue());
    } else {
        paused = true; // pause, as we are processing a request now
        request.continue();
    }
  });

  page.on('requestfinished', async (request) => {
      const response = await request.response();
      const url = response.url()

      if (url.includes("transactions")) {
        const { entries: transactions } = await response.json()
        console.log(transactions[0])
      }
      console.log(url);
      nextRequest(); // continue with next request
  });

  page.on('requestfailed', nextRequest);

  const getTransactions = async () => await page.evaluate(async () => 
    await new Promise(resolve => {
      const pendingTransactionsNode = document.querySelectorAll('[nodatamessage="card.ease.card.l2page.transactions.label.pending.transaction.nopendingtransactions.message"] c1-ease-row');
  
      resolve()
      })
    )
  
  res.send("Success")
});

const server = app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
  browser = await puppeteer.launch({ 
     args: ["--disable-web-security"],
     headless: false 
  });
  page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 720 });

  await page.goto('https://verified.capitalone.com/auth/signin', { waitUntil: 'networkidle0' }); // wait until page load
 
  await page.type('input[data-controlname="username"]', process.env.username);
  await page.type('input[data-controlname="password"]', process.env.password);

  // click and wait for navigation
  await Promise.all([
    page.click('.sign-in-button'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  
})

