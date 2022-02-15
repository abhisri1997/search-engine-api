const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const PORT = process.env.PORT || 8000;

const app = express();
const url = "https://www.google.co.in/search?num=10&q=";
var searchURL = "";
const data = [];
var nextPage = 0;
var nextURL = "";

app.get("/", (req, res) => {
  res.json(
    "Welcome to the api by - Abhinav Kumar, Navigate /api/{query} to check the api work."
  );
});

app.get("/api/:searchTerm", (req, res) => {
  //console.log(req.params.searchTerm);
  searchURL = url + req.params.searchTerm + "&start=" + nextPage;
  //console.log("Search URL: " + searchURL);

  async function scrapeSearches(searchURL) {
    await axios(searchURL, {
      headers: { "User-Agent": "GoogleSearcher/2.0 By Abhinav Kumar" },
    })
      .then((response) => {
        //console.log("Inside scrapeSearches");
        const html = response.data;
        const $ = cheerio.load(html);
        $("div > a > h3").each(function () {
          const title = $(this).text();
          const link = $(this).parent().attr("href");
          const url = link.slice(7, link.lastIndex);
          const page = nextPage;
          const pageURL = searchURL;
          ////console.log(url)
          data.push({
            title,
            url,
            page,
            pageURL,
          });
        });

        //res.json(data);
      })
      .catch((err) => {
        console.error(err);
      });
    return data;
  }

  async function scrapeNextUrls(data, nextUrl) {
    // //console.log(
    //   "Inside scrapeNextUrls: " + nextURL + " Length: " + nextURL.length
    // );
    while (nextPage <= 60) {
      await axios(nextURL, { headers: { "User-Agent": "TEST" } })
        .then((response) => {
          const nextPageHtml = response.data;
          const $ = cheerio.load(nextPageHtml);
          nextURL = searchURL + nextPage;
          //console.log("Inside Loop " + nextURL + " Length: " + nextUrl.length);
          $("div > a > h3").each(function () {
            const title = $(this).text();
            const link = $(this).parent().attr("href");
            const url = link.slice(7, link.lastIndex);
            const page = nextPage / 10;
            const pageURL = nextURL;
            ////console.log(url)
            data.push({
              title,
              url,
              page,
              pageURL,
            });
          });
        })
        .catch((err) => {
          console.error(err);
        });
      nextPage = nextPage + 10;
      //console.log(nextPage);
      await sleep(1000);
    }
    return data;
    //console.log(data);
  }

  async function sleep(miliseconds) {
    return new Promise((resolve) => setTimeout(resolve, miliseconds));
  }

  async function main() {
    //console.log("Inside Main");
    const data = await scrapeSearches(searchURL);
    nextURL = searchURL;
    const urlPageListings = await scrapeNextUrls(data, nextURL);
    ////console.log(data);
    res.json(data);
    data.splice(0, data.length);
    nextPage = 0;
  }

  main();
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
