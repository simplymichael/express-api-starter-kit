/* eslint-env node, mocha */

const { runTest }     = require("../../_test-util");
const { apiUrl }      = require("../_server");
const exampleApiRoute = `${apiUrl}/example`;
const listRoute       = `${exampleApiRoute}`;


describe(`List: GET ${listRoute}`, () => {
  it("should return a 200 status code", (done) => {
    runTest(function({ expect, request }) {
      request
        .get(listRoute)
        .end((err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 200);
          
          done();
        });
    });
  });
});
