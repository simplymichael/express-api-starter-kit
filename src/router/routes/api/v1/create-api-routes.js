const express = require("express");
const diContainer = require("../../../../di-container");

const injectDiContainerMiddleware = (req, res, next) => {
  req.diContainer = diContainer;
  next();
};


module.exports = function createApiRoutes(routeDefinitions) {
  const router = express.Router();

  Object.values(routeDefinitions).forEach((rd) => {
    const { method, path, parameters, middleware, handler } = rd;
    const url = path + (parameters.length > 0 ? `${parameters.join("/")}` : "");
    const middlewares = [injectDiContainerMiddleware].concat(middleware);

    router[method.toLowerCase()](url, ...middlewares, handler);
  });

  return router;
};
