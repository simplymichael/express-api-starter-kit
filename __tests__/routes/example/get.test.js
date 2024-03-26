/* eslint-env node, mocha */

const { runTest }     = require("../../_test-util");
const { apiUrl }      = require("../_server");
const exampleApiRoute = `${apiUrl}/example`;
const getRoute        = `${exampleApiRoute}/items`;


describe(`Get: GET ${getRoute}/:itemId`, () => {
  it("should return a 200 status code", (done) => {
    const itemId = 5;

    runTest(function({ expect, request }) {
      request
        .get(`${getRoute}/${itemId}`)
        .end((err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 200);
          
          done();
        });
    });
  });
});
