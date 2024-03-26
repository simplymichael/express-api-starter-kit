const fs = require("node:fs");
const path = require("node:path");
const router = {};
const apiRouteFiles = fs.readdirSync(__dirname);

for(let i = 0, len = apiRouteFiles.length; i < len; i++) {
  const fileName = path.basename(apiRouteFiles[i], ".js");

  if(fileName === "index") {
    continue;
  }

  router[fileName] = require(`./${fileName}`);
}

module.exports = router;
