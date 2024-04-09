const morgan = require("morgan");

// eslint-disable-next-line
module.exports = function logHttpRequests(app) {
  const logger = app.resolve("logger");
  const config = {
    stream: {
      // Configure Morgan to use our custom (winston) logger with the http severity
      write: (message) => logger.http("incoming-request", JSON.parse(message)),
    },
  };

  return morgan(formatter, config);
};

function formatter(tokens, req, res) {
  return JSON.stringify({
    method         : tokens.method(req, res),
    url            : tokens.url(req, res),
    status         : Number.parseFloat(tokens.status(req, res)),
    content_length : tokens.res(req, res, "content-length"),
    response_time  : Number.parseFloat(tokens["response-time"](req, res)),
  });
}
