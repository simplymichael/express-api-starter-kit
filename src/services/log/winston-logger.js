const winston  = require("winston");
require("winston-daily-rotate-file");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

const config = require("../../config");
const logtail = new Logtail(config.logtail.sourceToken);

const appName = config.app.name;
const rootDir = config.app.rootDir;
const logDir  = `${rootDir}/.logs`;


module.exports = createLogger;

/**
 * @return {Object} winston logger instance
 */
function createLogger() {
  const label = appName;
  const logFileConfig = {
    dirname       : logDir,
    filename      : "%DATE%.application.log",
    datePattern   : "YYYY-MM-DD-HH",
    maxSize       : "5m",
    maxFiles      : "30d",
    utc           : true,
    zippedArchive : true,
  };
  const combinedFileTransport = new winston.transports.DailyRotateFile(logFileConfig);
  const errorFileTransport = new winston.transports.DailyRotateFile({ 
    ...logFileConfig,
    filename: "%DATE%.application-error.log",
    level: "error",
  });
  const logtailTransport = new LogtailTransport(logtail);
  const formatters = winston.format.combine(
    winston.format.label({ label, message: true }),
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.colorize({ all: true }),
    winston.format.align(),
    winston.format.json(),
    winston.format.printf(customFormatter),
  );
  const logger = winston.createLogger({ 
    format: formatters, 
    transports: [combinedFileTransport, errorFileTransport, logtailTransport], 
    defaultMeta: { service: appName },
    exitOnError: false,
  });

  winston.addColors({
    debug : "blue",
    error : "red",
    info  : "green",
    warn  : "yellow",
  });

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  if(config.app.environment === "development") {
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
