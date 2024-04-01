const util = require("node:util");
const env = require("../dotenv");

module.exports = log;
module.exports.defaultLogger = getDefaultLogger();

/**
 * @param {Object} logger with member log which must be a function
 * @param {Object} logData
 * @param {String} [logData.type]: The type of message ("info", "error", "success")
 * @param {String} [logData.message]: The message to log
 * @param {Object} [logData.data]: Any extra data we wish to pass to the logger
 */
function log(logger, logData) {
  let { type, message, data } = logData;
  const types = ["info", "error", "success"];

  data = data || {};
  type = type.toLowerCase();
  type = types.includes(type) ? type : "info";

  if(!logger || typeof logger !== "object" || !("log" in logger)) {
    return;
  }

  if(logger === console) {
    console.log(`${type}: ${message} - data: ${util.inspect(data)}`);
  } else {
    logger.log({
      type,
      message,
      data,
      timestamp: Date.now(),
    });
  }
}

/**
 * Reference implementation of the logger object passed to the log function
 */
function getDefaultLogger() {
  let logger;
  const environment = env.NODE_ENV.toLowerCase();

  if(environment === "test") {
    logger =  {
      log() { /* DO NOTHING */ },
    };
  } else if(environment === "development") {
    logger = console;
  } else {
    /* TO DO: replace logger with a real logger client */
    logger =  {
      log() {}
    };
  }

  return logger;
}
