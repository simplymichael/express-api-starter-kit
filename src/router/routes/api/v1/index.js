const fs = require("node:fs");
const path = require("node:path");
const createApiRoutes = require("./create-api-routes");

const router = {};
const apiRouteFiles = fs.readdirSync(__dirname);

for(let i = 0, len = apiRouteFiles.length; i < len; i++) {
  const filename     = apiRouteFiles[i];
  const absolutepath = `${__dirname}${path.sep}${filename}`;

  if(filename === "index" || !fs.statSync(absolutepath).isDirectory()) {
    continue;
  }

  if(!fs.existsSync(`${absolutepath}/route-definitions.js`)) {
    throw new Error(`The ${absolutepath} directory must contain a route-definitions.js file`);
  }

  const routeDefinitions = require(`./${filename}/route-definitions`);

  router[filename] = createApiRoutes(routeDefinitions);
}

module.exports = router;
