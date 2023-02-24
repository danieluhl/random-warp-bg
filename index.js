const IMAGE_URL = "https://deepdreamgenerator.com/";
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const homedir = require("os").homedir();

function getImage() {
  console.log("FETCHING new background!");
  return axios.get(IMAGE_URL).then(function({ data }) {
    // scrape the image
    let $ = cheerio.load(data);
    const firstImageUrl = $(".container .content img:first")[0].attribs.src;
    // save the image
    axios({
      method: "get",
      url: firstImageUrl,
      responseType: "stream",
    }).then(function(response) {
      response.data.pipe(
        fs.createWriteStream(
          path.join(homedir, ".warp/themes/night_owl/deep.jpg"),
          {
            flags: "w",
          }
        )
      );
    });
  });
}

getImage().catch();
