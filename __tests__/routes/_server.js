/* eslint-env node, mocha */

const server   = require("../../src/index.js");
const testPort = 3003;
const baseUrl  = `http://localhost:${testPort}`;

server.stop = () => process.exit(0);

// Get the server running and listening on port
server.start({ 
  port: testPort, 
  onListening: () => console.log("Server listening on port: ", testPort),
  onError: (error) => console.log("Error occurred: ", error),
});


after(function(done) {
  setTimeout(async function() {
    server.stop();
    done();
  }, 0);
});


module.exports = {
  apiPort  : testPort,
  apiUrl   : `${baseUrl}/api`,
  baseUrl  : baseUrl, 
};
