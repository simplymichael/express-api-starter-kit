/* eslint-env node, mocha */

const server = require("../../src/index.js");
const apiRoutes = require("../../src/routes/api/v1/users");
const testPort = 3001;
const baseUrl  = `http://localhost:${testPort}`;
const apiUrl   = `${baseUrl}/api/v1`;

server.stop = () => process.exit(0);

// Get the server running and listening on port
server.start({
  port: testPort,
  onListening: () => console.log("Server listening on port: ", testPort),
  onError: (error) => console.log("Error occurred: ", error),
});


after(function(done) {
  setTimeout(function() {
    // Call done() before stopping the server
    // so that we can get the test report (20 passing, etc)
    // before server.stop() terminates the process.
    done();
    server.stop();
  }, 0);
});


module.exports = {
  apiPort  : testPort,
  apiPaths : apiRoutes,
  baseUrl  : baseUrl,
  usersUrl : `${apiUrl}/users`,
};
