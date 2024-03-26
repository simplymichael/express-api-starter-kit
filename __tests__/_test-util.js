const chai = () => import("chai").then(chai => chai);
const superagent = require("superagent");
const prefix = require("superagent-prefix");

const baseUrl = "localhost:3002";
const request = superagent.agent().use(prefix(baseUrl));


module.exports = {
  runTest,
};

function runTest(test) {
  chai().then(function(chai) {
    const { expect } = chai;

    test({ expect, request });
  });
}
