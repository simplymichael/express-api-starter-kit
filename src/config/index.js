const app = require("./app");
const database = require("./database");
const notification = require("./notification");
const redis = require("./redis");
const session = require("./session");


module.exports = Object.assign({}, app, database, notification, redis, session);
