const express = require("express");
const routeDefinitions = require("./definitions");

const router = express.Router();


Object.values(routeDefinitions).forEach((rd) => {
  const { method, path, parameters, middleware, controller } = rd;
  const url = path + (parameters.length > 0 ? `/${parameters.join("/")}` : "");

  router[method.toLowerCase()](url, ...middleware, controller);
});


module.exports = router;
