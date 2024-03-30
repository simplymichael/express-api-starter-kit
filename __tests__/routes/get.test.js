/* eslint-env node, mocha */

const { statusCodes } = require("../../src/helpers/http");
const { runTest } = require("../_test-util");
const { createUser, deleteUser, loginUser } = require("./_route-functions");
const { usersUrl } = require("./_server");

const userDataUrl   = `${usersUrl}`;

const userData = {
  firstname : "testPerson",
  lastname  : "userPerson",
  email     : "test-user-person@yahoo.com",
  password  : "T3stUser#",
};

let userId;
let accessToken;


describe(`Get User Details Route: GET ${userDataUrl}/:userId`, () => {
  before(async function() {
    const data = await createUser(userData);
    const auth = await loginUser(userData.email, userData.password);

    userId = data.data.user.id;
    accessToken = auth.data.authorization.token;
  });

  after(async function() {
    await deleteUser(userId, accessToken);

    userId = "";
    accessToken = "";
  });

  it("should return not found if user with `userId` does not exist", (done) => {
    runTest(async function({ expect, request }) {
      const invalidUserId = userId.split("").reverse().join("");

      request
        .get(`${userDataUrl}/${invalidUserId}`)
        .end((err, res) => {
          expect(res).to.have.property("status", statusCodes.notFound);
          expect(res).to.have.property("body").to.be.an("object");
          expect(res.body).not.to.have.property("data");
          expect(res.body).to.have.property("error").to.be.an("object");

          const error = res.body.error;

          expect(error).to.have.property("message", "No user with the given id exists.");
          expect(error).to.have.property("value", invalidUserId);
          expect(error).to.have.property("field", "userId");

          done();
        });
    });
  });

  it("should return user with specified `userId` if exists", (done) => {
    runTest(async function({ expect, request }) {
      request
        .get(`${userDataUrl}/${userId}`)
        .end(async (err, res) => {
          expect(res).to.have.property("status", statusCodes.ok);
          expect(res).to.have.property("body").to.be.an("object");
          expect(res.body).not.to.have.property("error");
          expect(res.body).to.have.property("data").to.be.an("object");

          const data = res.body.data;

          expect(data).to.have.property("user").to.be.an("object");

          const user = data.user;

          expect(user).to.have.property("id");
          expect(user).to.have.property("role", "user");
          expect(user).to.have.property("status", "pending");

          Object.keys(userData).forEach(prop => {
            if(prop !== "password") {
              expect(user).to.have.property(prop, userData[prop]);
            }
          });

          done();
        });
    });
  });
});
