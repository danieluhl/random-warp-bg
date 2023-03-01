
// This was a slower attempt using puppeteer
#!/bin/sh
":"; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const puppeteer = require("puppeteer");
const IMAGE_SITE_URL = "https://deepdreamgenerator.com/";
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();
const open = require("open");

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

// can't figure out how to get the image without
//   first hitting the website in a browser on my
//   computer
async function getWarpImage(theme = "night_owl") {
  open(IMAGE_SITE_URL);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(IMAGE_SITE_URL);
  const element = await page.waitForSelector(
    ".container .content img.light-gallery-item"
  );
  saveImage(element.src, `.warp/themes/${theme}/deep.jpg`);

  await browser.close();
}

function saveImage(imageUrl, savePath) {
  axios({
    method: "get",
    url: imageUrl,
    responseType: "stream",
  })
    .then(function(response) {
      response.data.pipe(
        fs.createWriteStream(path.join(homedir, savePath), {
          flags: "w",
        })
      );
    })
    .catch((e) => {
      console.log("err on saving image", e);
    });
}

getWarpImage(argv.theme);
