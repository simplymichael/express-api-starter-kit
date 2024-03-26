/* eslint-env node, mocha */

const { runTest }     = require("../../_test-util");
const { apiUrl }      = require("../_server");
const exampleApiRoute = `${apiUrl}/example`;
const createRoute     = `${exampleApiRoute}`;


describe(`Create: POST ${createRoute}`, () => {
  it("should return a 200 status code", (done) => {
    runTest(function({ expect, request }) {
      request
        .post(createRoute)
        .send({})
        .end((err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 200);
          
          done();
        });
    });
  });
});
