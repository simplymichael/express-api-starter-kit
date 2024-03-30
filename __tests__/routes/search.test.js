/* eslint-env node, mocha */

const { runTest } = require("../_test-util");
const { apiPaths, usersUrl } = require("./_server");
const searchRoute = `${usersUrl}${apiPaths.searchUsers.path}`;


describe(`Users Search Route: GET ${searchRoute}`, () => {
  it("should return a 200 status code", (done) => {
    runTest(function({ expect, request }) {
      request
        .get(`${searchRoute}?query=Lanister`)
        .end((err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 200);


          done();
        });
    });
  });
});
