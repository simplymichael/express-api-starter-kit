const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const config = require("../config");

const rootDir = config.app.rootDir;
const routesPath = `${rootDir}/src/routes/api/v1`;

const router = {};
const routeFiles = fs.readdirSync(routesPath);

for(let i = 0, len = routeFiles.length; i < len; i++) {
  const filename = path.basename(routeFiles[i], ".js");
  const routeDefinitions = require(`${routesPath}/${filename}`);

  router[filename] = createApiRoutes(routeDefinitions);
}

module.exports = router;


// Helper functions
function createApiRoutes(routeDefinitions) {
  const router = express.Router();

  Object.values(routeDefinitions).forEach((rd) => {
    const { method, path, parameters, middleware, handler } = rd;
    const url = path + (parameters.length > 0 ? `${parameters.join("/")}` : "");

    router[method.toLowerCase()](url, ...middleware, handler);
  });

  return router;
}
