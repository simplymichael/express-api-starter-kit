const express = require("express");


module.exports = function createApiRoutes(routeDefinitions) {
  const router = express.Router();

  Object.values(routeDefinitions).forEach((rd) => {
    const { method, path, parameters, middleware, handler } = rd;
    const url = path + (parameters.length > 0 ? `${parameters.join("/")}` : "");

    router[method.toLowerCase()](url, ...middleware, handler);
  });

  return router;
};
