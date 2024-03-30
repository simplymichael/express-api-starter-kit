const path     = require("path");
const winston  = require("winston");
require("winston-daily-rotate-file");
const env = require("../../dotenv");


const rootDir = ["development", "test"].includes(env.NODE_ENV.toLowerCase())
  ? path.resolve(path.dirname(__dirname), "..")
  : path.resolve(path.dirname(__dirname), "..");

const logDir  = `${rootDir}${path.sep}.logs`;


module.exports = createLogger;

/**
 * @return {Object} winston logger instance
 */
function createLogger() {
  const label = env.NAME;
  const file = new winston.transports.DailyRotateFile({
    dirname       : logDir,
    filename      : "%DATE%.application.log",
    datePattern   : "YYYY-MM-DD-HH",
    maxSize       : "5m",
    utc           : true,
    zippedArchive : true,
  });
  const formatters = winston.format.combine(
    winston.format.label({ label, message: true }),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(customFormatter),
  );
  const logger = winston.createLogger({ format: formatters, transports: [file] });

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  if(env.NODE_ENV.toLowerCase() === "development") {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  return logger;


  // Private Helper functions
  function customFormatter(info) {
    const formatStr = [
      `"timestamp"      : "${info.timestamp}"`,
      `"pid"            : "${process.pid}"`,
      `"level"          : "${info.level}"`,
      `"code"           : "${info.code}"`,
      `"errno"          : "${info.errno}"`,
      `"erroredSysCall" : "${info.erroredSysCall}"`,
      `"type"           : "${info.type}"`,
      `"label"          : "${label}"`,
      `"message"        : "${info.message}"`
    ].join(",");

    return `{${formatStr}}`;
  }
}
