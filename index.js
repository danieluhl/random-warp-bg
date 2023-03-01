#!/bin/sh
':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const IMAGE_SITE_URL = 'https://deepdreamgenerator.com/';
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();

const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

function getImage(theme = 'night_owl') {
  console.log(`Fetching new background for your warp theme ${theme}`);
  return axios.get(IMAGE_SITE_URL).then(function({ data }) {
    // scrape the image
    let $ = cheerio.load(data);

    const images = $('.container .content img.light-gallery-item');
    // grab one of the top half of all the images on the main page
    const imageIndex = Math.floor((Math.random() * images.length) / 2);
    console.log(images[imageIndex].attribs);
    const firstImageUrl = images[imageIndex].attribs.src;
    console.log({ firstImageUrl });
    // save the image
    axios({
      method: 'get',
      url: firstImageUrl,
      responseType: 'stream',
    }).then(function(response) {
      response.data.pipe(
        fs.createWriteStream(
          path.join(homedir, `.warp/themes/${theme}/deep.jpg`),
          {
            flags: 'w',
          }
        )
      );
    });
  });
}

getImage(argv.theme);
