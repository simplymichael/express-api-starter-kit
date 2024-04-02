const config = require("../config");
const debug = require("debug")(config.app.debugKey);

module.exports = debug;
