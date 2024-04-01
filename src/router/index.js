const v1 = require("./api-v1-router");

module.exports = function createRouters() {
  return {
    "api-v1": v1(),
  };
};
