const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const config = require("../config");
const diContainer = require("../di-container");

const router = {};
const rootDir = config.app.rootDir;
const routesPath = `${rootDir}/src/routes/api/v1`;
const routeFiles = fs.readdirSync(routesPath);


module.exports = function createRouter() {
  for(let i = 0, len = routeFiles.length; i < len; i++) {
    const filename = path.basename(routeFiles[i], ".js");
    const routeDefinitions = require(`${routesPath}/${filename}`);
  
    router[filename] = createApiRoutes(routeDefinitions);
  }

  return router;
};


// Helper functions
function createApiRoutes(routeDefinitions) {
  const router = express.Router();

  Object.values(routeDefinitions).forEach((rd) => {
    let requestHandler;
    const { method, path, parameters, middleware, handler } = rd;
    const url = path + (parameters.length > 0 ? `${parameters.join("/")}` : "");

    if(typeof handler === "function") {
      requestHandler = handler;
    } else if(Array.isArray(handler) && handler.length === 2) {
      const [controller, method] =  handler;

      requestHandler = createRequestHandler(controller, method);
    } else if(handler && typeof handler === "object" && "controller" in handler && "method" in handler) {
      const { controller, method } = handler;

      requestHandler = createRequestHandler(controller, method);
    } else if(typeof handler === "string") {
      const [controller, method] = handler.split(".").map(s => s.trim());

      requestHandler = createRequestHandler(controller, method);
    } else {
      throw new TypeError(
        `Invalid handler ${handler} specified for ${method} ${path}.
        The handler should be a function, an array of the form [controller: string, method: string] 
        or an object with two properties: controller: string, method: string.
        `
      );
    }

    // Give every route handler a this.register() and this.resolve() methods.
    // Useful for stand-alone function request handlers.
    // Controller methods already have these methods via the controller itself.
    makeObjectADIContainer(requestHandler);

    router[method.toLowerCase()](url, ...middleware, requestHandler);
  });

  return router;
}

/**
 * 
 * @param {String|Object} controllerRef: A controller name string or a reference to a controller object.
 *   If this is a string, the corresponding name must have been registered in the DI Container.
 * @param {String|Object} methodRef: A method name string or a reference to a callable. 
 *   The method must exist as a member of the controller. 
 * @returns {Callable}
 */
function createRequestHandler(controllerRef, methodRef) {
  let controller;
  let methodName;

  if(typeof controllerRef === "string") {
    controller = diContainer.resolve(controllerRef);
  } else {
    controller = controllerRef;
  }

  if(!controller)  {
    throw new TypeError(`Controller ${controllerRef} not found`);
  }

  makeObjectADIContainer(controller); // Give every method a this.register() and this.resolve() properties

  if(typeof methodRef === "string" && (methodRef in controller)) {
    methodName = methodRef;
  } else if(methodRef.name in controller) {
    methodName = methodRef.name;
  }

  if(!methodName) {
    throw new TypeError(`No such method ${methodName} found in controller ${controllerRef}`);
  }

  return controller[methodName].bind(controller);
}

function makeObjectADIContainer(obj) {
  if(!("resolve" in obj)) {
    obj.resolve = diContainer.resolve.bind(diContainer);
  }
}
