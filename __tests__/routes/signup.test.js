/* eslint-env node, mocha */

const env = require("../../dotenv");
const allTestUsers = require("../model/_test-users.json");
const { getRandomData, runTest } = require("../_test-util");
const { createUser, loginAndDeleteUser } = require("./_route-functions");
const { apiPaths, usersUrl } = require("./_server");


const testUsers = allTestUsers.slice(4, 6);
const passwordMinLen = env.PASSWORD_MIN_LENGTH;
const passwordMaxLen = env.PASSWORD_MAX_LENGTH;
const forbiddenPasswords = env.DISALLOWED_PASSWORDS.split(",").map(str => str.trim());
const signupRoute = `${usersUrl}${apiPaths.signup.path}`;

function cloneUser(user) {
  return  { ...user };
}

function assertValidationExpectations(expect, res, field, status) {
  expect(res).to.be.an("object");
  expect(res).to.have.property("status", status || 400);
  expect(res).to.have.property("body").to.be.an("object");
  expect(Array.isArray(res.body.errors) || (typeof res.body.error === "object"))
    .to.equal(true);

  if(Array.isArray(res.body.errors)) {
    res.body.errors.forEach(err => {
      expect(err).to.be.an("object");
      expect(err).to.have.property("field", field);
    });
  } else if(typeof res.body.error === "object") {
    expect(res.body.error).to.have.property("field", field);
  }
}


describe(`User Registration Route: POST ${signupRoute}`, function() {
  const userData = testUsers[0];

  it("should return a 400 status code if firstname is missing", (done) => {
    const clonedUser = cloneUser(userData);
    delete clonedUser.firstname;

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "firstname");
          done();
        });
    });
  });

  it("should return a 400 status code if lastname is missing", (done) => {
    const clonedUser = cloneUser(userData);
    delete clonedUser.lastname;

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "lastname");
          done();
        });
    });
  });

  it("should return a 400 status code if email is missing", (done) => {
    const clonedUser = cloneUser(userData);
    delete clonedUser.email;

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "email");
          done();
        });
    });
  });

  it("should return a 400 status code if password is missing", (done) => {
    let clonedUser = cloneUser(userData);
    delete clonedUser.password;

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it(`should return a 400 status code if password length is less than ${passwordMinLen}`, (done) => {
    const clonedUser = cloneUser({ ...userData, password: "s3crEts" });

    runTest(function({ expect, request}) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it(`should return a 400 status code if password length is greater than ${passwordMaxLen}`, (done) => {
    let password = "s3cRet#";

    for(let i = 0; i < Math.floor(passwordMaxLen/2); i++) {
      password += password;
    }

    const clonedUser = cloneUser({ ...userData, password });

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it("should return a 400 status code if password does not contain a number", (done) => {
    const clonedUser = cloneUser({ ...userData, password: "heLlios#"});

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it("should return a 400 status code if password does not contain an uppercase character", (done) => {
    const clonedUser = cloneUser({ ...userData, password: "h3llios@" });

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it("should return a 400 status code if password does not contain a lowercase character", (done) => {
    const clonedUser = cloneUser({ ...userData, password: "H3LLIOS%" });

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it("should return a 400 status code if password is in password blacklist", (done) => {
    const clonedUser = cloneUser({ ...userData, password: getRandomData(forbiddenPasswords) });

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "password");
          done();
        });
    });
  });

  it("should create user and return success data if all values are valid", (done) => {
    const clonedUser = cloneUser(userData);

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end(async (err, res) => {
          expect(res).to.be.an("object");
          expect(res).to.have.property("status", 201);
          expect(res).to.have.property("body").to.be.an("object");
          expect(res.body).to.have.property("data").to.be.an("object");
          expect(res.body.data).to.have.property("user").to.be.an("object");

          const user = res.body.data.user;

          expect(user).to.have.property("id");
          expect(user).to.have.property("signupDate");
          expect(user).to.have.property("password", "*".repeat(10));

          for(const prop of Object.keys(clonedUser)) {
            if(prop === "password") {
              continue;
            }

            expect(user).to.have.property(prop, clonedUser[prop]);
          }

          await loginAndDeleteUser({ ...clonedUser, id: user.id });

          done();
        });
    });
  });
});

describe("User Registration Route (Already Existing User): POST", () => {
  const userData = testUsers[1];
  const clonedUser = cloneUser(userData);

  before(async () => {
    const data = await createUser(clonedUser);

    clonedUser.id = data.data.user.id;
  });

  after(async () => await loginAndDeleteUser(clonedUser));

  it("should return a 409 status code if email is taken", (done) => {
    const clonedUser = cloneUser(userData);

    runTest(function({ expect, request }) {
      request
        .post(signupRoute)
        .send(clonedUser)
        .end((err, res) => {
          assertValidationExpectations(expect, res, "email", 409);
          done();
        });
    });
  });
});
