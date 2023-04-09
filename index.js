#!/usr/bin/env node

const IMAGE_SITE_URL = "https://deepdreamgenerator.com/";
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const homedir = require("os").homedir();
const sizeOf = require("image-size");
const https = require("https");

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

const THEME_NAME = "random_bg";
const THEME_PATH = path.join(homedir, ".warp/themes", THEME_NAME);
// if the theme doesn't exist, create it
function checkAndAddTheme() {
  const templatePath = path.join(__dirname, THEME_NAME);
  try {
    if (!fs.existsSync(THEME_PATH)) {
      fs.copySync(templatePath, THEME_PATH, { overwrite: true });
    }
  } catch (e) {
    console.log("Failed to check if theme exists", e);
  }
}

function didAlreadyFetch() {
  const { lastFetchedDay } = JSON.parse(
    fs.readFileSync(path.join(THEME_PATH, ".random_bg_data.json"))
  );
  const today = new Date().getDate();
  console.log({ lastFetchedDay, today });
  // update the date in the file
  fs.writeFileSync(
    path.join(THEME_PATH, ".random_bg_data.json"),
    JSON.stringify({ lastFetchedDay: today })
  );
  // fetch only once per day
  return lastFetchedDay === today;
}

const saveImage = (imageUrl, savePath) => {
  return new Promise((res, rej) => {
    https.get(imageUrl, (response) => {
      response.on("error", (error) => {
        console.error(error);
        rej(error);
      });

      const file = fs.createWriteStream(savePath, {
        flags: "w",
      });

      file.on("finish", () => {
        console.log("File saved successfully");
        res(savePath);
      });

      response.pipe(file);
    });
  });
};

let imageCache;

const fetchImageUrls = () => {
  return axios.get(IMAGE_SITE_URL).then(function({ data }) {
    // scrape the image url
    let $ = cheerio.load(data);

    const images = Array.from($(".container .content img.light-gallery-item"));
    const urls = images.map((img) => img.attribs["data-src"]).filter(Boolean);
    // shuffle
    urls.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));
    console.log(`found ${urls.length} images...`);
    return urls;
  });
};

async function downloadGoodImage() {
  console.log(`Fetching new background for warp...`);

  if (!imageCache) {
    console.log("fetching new images");
    imageCache = await fetchImageUrls();
  }

  let hasGoodImage;
  let nextUrl;
  const savePath = path.join(THEME_PATH, `${THEME_NAME}.jpg`);
  while (!hasGoodImage && imageCache.length > 0) {
    nextUrl = imageCache.pop();
    const img = await saveImage(nextUrl, savePath);

    const size = await sizeOf(savePath);
    if (size && size.width > size.height) {
      hasGoodImage = true;
    }
  }
  return { src: nextUrl, path: savePath };
}

function main(force) {
  checkAndAddTheme();
  if (force || !didAlreadyFetch()) {
    downloadGoodImage().then(({ src, path }) => {
      if (!src) {
        console.error("Sorry, we were unable to find any good images today");
      } else {
        console.log(`New background downloaded, restart warp to check it out!`);
        console.log(`src: ${src}`);
        console.log(`to: ${path}`);
      }
    });
  } else {
    console.log(
      "Looks like we already fetched a new background image today, run with --force to force a new fetch"
    );
  }
}

main(argv.force);
