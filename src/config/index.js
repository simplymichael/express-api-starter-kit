const app = require("./app");
const database = require("./database");
const novu = require("./novu");
const redis = require("./redis");
const session = require("./session");


module.exports = Object.assign({}, app, database, novu, redis, session);
