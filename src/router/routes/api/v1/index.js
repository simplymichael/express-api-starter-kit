const fs = require("node:fs");
const path = require("node:path");
const router = {};
const apiRouteFiles = fs.readdirSync(__dirname);

for(let i = 0, len = apiRouteFiles.length; i < len; i++) {
  const filename     = apiRouteFiles[i];
  const absolutepath = `${__dirname}${path.sep}${filename}`;

  if(filename === "index" || !fs.statSync(absolutepath).isDirectory()) {
    continue;
  }

  if(!fs.existsSync(`${absolutepath}/index.js`)) {
    throw new Error(`The ${absolutepath} directory must contain an index.js file`);
  }

  if(!fs.existsSync(`${absolutepath}/definitions.js`)) {
    throw new Error(`The ${absolutepath} directory must contain a definitions.js file`);
  }

  router[filename] = require(`./${filename}`);
}

module.exports = router;
