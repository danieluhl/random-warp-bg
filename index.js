#!/usr/bin/env node
// #!/bin/sh
// ":"; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const IMAGE_SITE_URL = "https://deepdreamgenerator.com/";
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

const argv = require("yargs/yargs")(process.argv.slice(2)).argv;

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

function getImage(theme = "night_owl") {
  console.log(`Fetching new background for your warp theme ${theme}`);
  return axios.get(IMAGE_SITE_URL).then(function({ data }) {
    // scrape the image
    let $ = cheerio.load(data);

    const images = $(".container .content img.light-gallery-item");
    console.log(`found ${images.length} images`);
    // grab one of the top half of all the images on the main page
    const imageIndex = Math.floor((Math.random() * images.length) / 2);
    console.log("Image Attributes Object:");
    console.log(images[imageIndex].attribs);
    let firstImageUrl = images[imageIndex].attribs.src;
    if (!firstImageUrl) {
      // sometimes its data-src
      firstImageUrl = images[imageIndex].attribs["data-src"];
    }
    console.log({ firstImageUrl });
    // save the image
    saveImage(firstImageUrl, `.warp/themes/${theme}/deep.jpg`);
  });
}

getImage(argv.theme);
