#!/usr/bin/env node
// #!/bin/sh
// ":"; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const IMAGE_SITE_URL = 'https://deepdreamgenerator.com/';
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const homedir = require('os').homedir();

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

const THEME_NAME = 'random_bg';
const THEME_PATH = path.join(homedir, '.warp/themes', THEME_NAME);
// if the theme doesn't exist, create it
function checkAndAddTheme() {
  const templatePath = path.join(__dirname, THEME_NAME);
  try {
    if (!fs.existsSync(THEME_PATH)) {
      fs.copySync(templatePath, THEME_PATH, { overwrite: true });
    }
  } catch (e) {
    console.log('Failed to check if theme exists', e);
  }
}

function didAlreadyFetch() {
  const { lastFetchedDate } = JSON.parse(
    fs.readFileSync(path.join(THEME_PATH, '.random_bg_data.json'))
  );
  const lastDate = new Date(lastFetchedDate).getDay();
  const today = new Date().getDay();
  console.log({ lastDate, today });
  // fetch only once per day
  return lastDate === today;
}

function saveImage(imageUrl, savePath) {
  axios({
    method: 'get',
    url: imageUrl,
    responseType: 'stream',
  })
    .then(function(response) {
      response.data.pipe(
        fs.createWriteStream(savePath, {
          flags: 'w',
        })
      );
    })
    .catch((e) => {
      console.log('err on saving image', e);
    });
}

function getImage() {
  console.log(`Fetching new background for warp...`);
  return axios.get(IMAGE_SITE_URL).then(function({ data }) {
    // scrape the image url
    let $ = cheerio.load(data);

    const images = $('.container .content img.light-gallery-item');
    console.log(`found ${images.length} images...`);
    // grab one of the top half of all the images on the main page
    const imageIndex = Math.floor((Math.random() * images.length) / 2);
    let firstImageUrl = images[imageIndex].attribs.src;
    if (!firstImageUrl) {
      // sometimes its data-src
      firstImageUrl = images[imageIndex].attribs['data-src'];
    }
    console.log({ firstImageUrl });
    return firstImageUrl;
  });
}

function main(force) {
  checkAndAddTheme();
  if (force || !didAlreadyFetch()) {
    getImage().then((imageUrl) => {
      saveImage(imageUrl, path.join(THEME_PATH, `${THEME_NAME}.jpg`));
      console.log('ALL SET! Restart warp and pick the "Random Bg" theme!');
    });
  } else {
    console.log(
      'Looks like we already fetched a new background image today, run with --force to force a new fetch'
    );
  }
}

main(argv.force);
