/* eslint-env node, mocha */

const { statusCodes } = require("../../src/helpers/http");
const { runTest } = require("../_test-util");
const { createUser, fetchUserData, loginUser } = require("./_route-functions");
const { usersUrl } = require("./_server");

const userDeleteUrl = `${usersUrl}`;
const userData = {
  firstname : "test",
  lastname  : "user",
  email     : "test-user@yahoo.com",
  password  : "T3stUser#",
};

let userId;
let accessToken;


describe(`Delete User Route: DELETE ${userDeleteUrl}/:userId`, () => {
  before(async function() {
    const data = await createUser(userData);
    const auth = await loginUser(userData.email, userData.password);

    userId = data.data.user.id;
    accessToken = auth.data.authorization.token;
  });

  it("should delete the user specified by `userId`", (done) => {
    runTest(async function({ expect, request }) {
      const data = await fetchUserData(userId);

      expect(data).to.have.property("data").to.be.an("object");
      expect(data.data).to.have.property("user").to.be.an("object");
      expect(data.data.user).to.have.property("id");
      expect(data.data.user).to.have.property("role", "user");
      expect(data.data.user).to.have.property("status", "pending");

      Object.keys(userData).forEach(prop => {
        if(prop !== "password") {
          expect(data.data.user).to.have.property(prop, userData[prop]);
        }
      });

      request
        .delete(`${userDeleteUrl}/${userId}`)
        .set({ Authorization: accessToken })
        .send({ userId })
        .end(async (err, res) => {
          expect(res).to.have.property("status", statusCodes.ok);

          const data = await fetchUserData(userId);

          expect(data).to.have.property("error").to.be.an("object");
          expect(data.error).to.have.property("message", "No user with the given id exists.");
          expect(data.error).to.have.property("value", userId);

          done();
        });
    });
  });
});
