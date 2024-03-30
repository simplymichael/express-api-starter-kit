/* eslint-env node, mocha */

const { runTest } = require("../_test-util");
const allTestUsers = require("../model/_test-users.json");
const { createUser, deleteUser, loginUser } = require("./_route-functions");
const { apiPaths, usersUrl } = require("./_server");

const usersRoute = `${usersUrl}${apiPaths.listUsers.path}`;
const testUsers = allTestUsers.slice(7);
const createdUsers = [];


describe(`Users Listing Route: GET ${usersRoute}`, () => {
  before(async function() {
    // First populate the users table
    for(const userData of testUsers) {
      const res = await createUser(userData);
      const user = res.data.user;

      createdUsers.push(user);
    }
  });

  after(async function() {
    for(const user of createdUsers) {
      const targetUser = testUsers.find(u => u.email === user.email);
      const auth = await loginUser(targetUser.email, targetUser.password);
      const accessToken = auth.data.authorization.token;

      await deleteUser(user.id, accessToken);
    }
  });

  it("should return every registered user", (done) => {
    runTest(function({ expect, request }) {
      request
        .get(usersRoute)
        .end((err, res) => {
          expect(res).to.have.property("status", 200);
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.have.property("total").to.be.at.least(testUsers.length);
          expect(res.body.data).to.have.property("length").to.be.at.least(testUsers.length);
          expect(res.body.data).to.have.property("users").to.be.an("array");
          expect(res.body.data.users).to.have.lengthOf.at.least(testUsers.length);

          res.body.data.users.forEach(user => {
            expect(user).to.have.property("id");
            expect(user).to.have.property("firstname");
            expect(user).to.have.property("lastname");
            expect(user).to.have.property("email");
            expect(user).to.have.property("signupDate");
            expect(user).to.have.property("password", "*".repeat(10));
          });

          done();
        });
    });
  });
});
