#!/usr/bin/env node

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
  }).then(function(response) {
    response.data.pipe(
      fs.createWriteStream(path.join(homedir, savePath), {
        flags: "w",
      })
    );
  });
}

function getImage(theme = "night_owl") {
  console.log(`Fetching new background for your warp theme ${theme}`);
  return axios.get(IMAGE_SITE_URL).then(function({ data }) {
    // scrape the image
    let $ = cheerio.load(data);

    const images = $(".container .content img.light-gallery-item");
    // grab one of the top half of all the images on the main page
    const imageIndex = Math.floor((Math.random() * images.length) / 2);
    console.log(images[imageIndex].attribs);
    const firstImageUrl = images[imageIndex].attribs.src;
    console.log({ firstImageUrl });
    // save the image
    saveImage(firstImageUrl, `.warp/themes/${theme}/deep.jpg`);
  });
}

getImage(argv.theme);
