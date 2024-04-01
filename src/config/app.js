const path = require("node:path");
const env = require("../../dotenv");

const config = {
  app: {
    environment : env.NODE_ENV.trim().toLowerCase(),
    name        : env.NAME.trim(),
    rootDir     : path.resolve(path.dirname(__dirname), "..").replace(/\\/g, "/"),
  },
};


module.exports = config;
