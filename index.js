const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const PORT = process.env.PORT || 8000;

const app = express();
const url = "https://www.google.co.in/search?q=";
searchURL = "";
const data = [];

app.get("/", (req, res) => {
  res.json("Welcome to the api by - Abhinav Kumar, Navigate /api/{query} to check the api work.")
})

app.get("/api/:searchTerm", (req, res) => {
  console.log(req.params.searchTerm);
  searchURL = url + req.params.searchTerm;
  console.log("Search URL: " + searchURL);
  axios(searchURL, { headers: { "User-Agent": "TEST" } })
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $("div > a > h3").each(function () {
        const title = $(this).text();
        const link = $(this).parent().attr("href");
        const url = link.slice(7, link.lastIndex);
        console.log(url)
        data.push({
          title,
          url
        });
      });

      res.json(data);
    })
    .catch((err) => {
      console.error(err);
    });
});

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
