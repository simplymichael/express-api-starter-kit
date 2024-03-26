const express = require("express");
const routingData = require("./routing-data");

const router = express.Router();


Object.values(routingData).forEach((routeData) => {
  const { method, path, parameters, middleware, controller } = routeData;
  const url = path + (parameters.length > 0 ? `/${parameters.join("/")}` : "");

  router[method.toLowerCase()](url, ...middleware, controller);
});


module.exports = router;
