const chai = () => import("chai").then(chai => chai);
const superagent = require("superagent");
const prefix = require("superagent-prefix");

const baseUrl = "localhost:3001";
const request = superagent.agent().use(prefix(baseUrl));


module.exports = {
  getRandomData,
  runTest,
};


function getRandomData(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function runTest(test) {
  chai().then(function(chai) {
    const { expect } = chai;

    test({ expect, request });
  });
}
