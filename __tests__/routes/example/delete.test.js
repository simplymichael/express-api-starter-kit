/* eslint-env node, mocha */

const { runTest }     = require("../../_test-util");
const { apiUrl }      = require("../_server");
const exampleApiRoute = `${apiUrl}/example`;
const deleteRoute     = `${exampleApiRoute}/items`;


describe(`Delete: DELETE ${deleteRoute}/:itemId`, () => {
  it("should return a 200 status code", (done) => {
    const itemId = 1;

    runTest(function({ expect, request }) {
      request
        .delete(`${deleteRoute}/${itemId}`)
        .send({})
        .end((err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 200);
          
          done();
        });
    });
  });
});
