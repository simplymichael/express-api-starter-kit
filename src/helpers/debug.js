const env = require("../../dotenv");
const debug = require("debug")(env.DEBUG_KEY);

module.exports = debug;
