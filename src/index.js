const http  = require("http");
const app   = require("./app");
const env   = require("./dotenv");
const debug = require("./helpers/debug");

const port = normalizePort(env.PORT);


function startServer({ port, onError, onListening }) {
  const server = http.createServer(app);

  // Listen on provided port, on all network interfaces.
  server.listen(port);

  if(typeof onError === "function") {
    server.on("error", (error) => onError(error, port));
  }

  if(typeof onListening === "function") {
    server.on("listening", () => onListening(server));
  }
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error, port) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case "EACCES":
    console.error(bind + " requires elevated privileges");
    process.exit(1);
    break;
  case "EADDRINUSE":
    console.error(bind + " is already in use");
    process.exit(1);
    break;
  default:
    throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server) {
  var addr = server.address();
  var bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port;
  debug("Listening on " + bind);
  console.log("Server listening on ", bind);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


if(require.main === module) {
  startServer({ port, onError, onListening });
}

module.exports = { 
  start: startServer, 
};
