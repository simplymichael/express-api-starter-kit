/* eslint-env node, mocha */

const config = require("../../src/config");
const MongooseStore = require("../../src/model/mongoose");
const UserRepository = require("../../src/repositories/user-repository/mongoose/");
const { getRandomData, runTest } = require("../_test-util");
let testUsers = require("./_test-users.json");

testUsers = testUsers.slice(0, 4);
const mongooseStore = new MongooseStore({ 
  ...config.database.mongodb,
  logger: { log() {} },
});
const db = new UserRepository({ MongooseStore: mongooseStore });


async function createTestUsers(users) {
  for(const userData of users) {
    const user = await db.createUser(userData);
    const targetUser = users.find(curruser => curruser === userData);

    targetUser.id = user.id;
    targetUser.signupDate = user.signupDate;
  }
}

async function deleteTestUsers(users) {
  for(const user of users) {
    await db.deleteUser(user.id);
  }
}


describe("UserModel", function() {
  describe("Create User", function() {
    this.timeout(5000);
    const users = testUsers.slice(0, 2);

    function assertValidationError(expect, error, fieldName) {
      const fieldNameInDb = ["firstname", "lastname"].includes(fieldName)
        ? `name.${fieldName.substring(0, fieldName.length - 4)}`
        : fieldName;

      expect(error).to.be.an("object");
      expect(error).to.have.property("type", "VALIDATION_ERROR");
      expect(error).to.have.property("errors");
      expect(error.errors).to.be.an("array");
      expect(error.errors[0]).to.be.an("object");
      expect(error.errors[0]).to.have.property("field", fieldNameInDb);
    }

    function testFieldMissing(field) {
      it(`should reject with a VALIDATION_ERROR if "${field}" is missing`, (done) => {
        const userData = { ...getRandomData(users) };
        delete userData[field];

        runTest(async function({ expect }) {
          try {
            await db.createUser(userData);
          } catch(e) {
            assertValidationError(expect, e, field);
            done();
          }
        });
      });
    }

    ["firstname", "lastname", "email", "password"].forEach(testFieldMissing);

    it("should create a user and return an object when every value is supplied", (done) => {
      const userData = getRandomData(users);

      runTest(async function({ expect }) {
        const user = await db.createUser(userData);
        expect(user).to.be.an("object");
        expect(user).to.have.property("id");
        expect(user).to.have.property("firstname").to.equal(userData.firstname);
        expect(user).to.have.property("lastname").to.equal(userData.lastname);
        expect(user).to.have.property("email").to.equal(userData.email);
        expect(user).to.have.property("password").to.equal("*".repeat(10));
        expect(user).to.have.property("signupDate").to.be.instanceOf(Date);

        await db.deleteUser(user.id);
        done();
      });
    });

    it("should reject with an error if user with email already exists", (done) => {
      const userData = { ...getRandomData(users) };

      runTest(async function({ expect }) {
        const user = await db.createUser(userData);

        expect(user).to.be.an("object");
        expect(user).to.have.property("id");
        expect(user).to.have.property("firstname").to.equal(userData.firstname);
        expect(user).to.have.property("lastname").to.equal(userData.lastname);
        expect(user).to.have.property("email").to.equal(userData.email);
        expect(user).to.have.property("password");
        expect(user).to.have.property("signupDate").to.be.instanceOf(Date);

        try {
          await db.createUser({ ...userData });
        } catch(err) {
          expect(err).to.be.an.an("object").to.have.property("type");
          expect(["USER_EXISTS_ERROR", "VALIDATION_ERROR"]).to.include(err.type);
          expect(err).to.have.property("error");

          await db.deleteUser(user.id);
          done();
        }
      });
    });
  });

  describe("Get Users", () => {
    const users = testUsers.slice(2);
    const usersBackup = users.slice();

    beforeEach(async function() {
      await createTestUsers(testUsers);
    });

    afterEach(async function() {
      await deleteTestUsers(testUsers);
    });

    function assertFetchedUsers(expect, fetchedUsers, field, value) {
      const firstnames = usersBackup.map(user => user.firstname);
      const lastnames = usersBackup.map(user => user.lastname);
      const emails = usersBackup.map(user => user.email);

      fetchedUsers.forEach(user => {
        expect(user).to.be.an("object");
        expect(user).to.have.property("id");
        expect(user).to.have.property("firstname").to.be.a("string");
        expect(firstnames).to.include(user.firstname);
        expect(user).to.have.property("lastname").to.be.a("string");
        expect(lastnames).to.include(user.lastname);
        expect(user).to.have.property("email").to.be.a("string");
        expect(emails).to.include(user.email);
        expect(user).to.have.property("signupDate").to.be.instanceOf(Date);

        if(field && value) {
          expect(user[field]).to.equal(value);
        }
      });
    }

    it("should return every user if no filters are specified", (done) => {
      runTest(async function({ expect }) {
        const result = await db.findMany();

        expect(result).to.be.an("object");
        expect(result).to.have.property("total").to.be.at.least(users.length);
        expect(result).to.have.property("length").to.be.at.least(users.length);
        expect(result).to.have.property("users").to.be.an("array");

        const fetchedUsers = result.users.filter(user => {
          return users.find(u => u.email === user.email);
        });

        expect(fetchedUsers.length).to.be.at.least(users.length);

        assertFetchedUsers(expect, fetchedUsers);
        done();
      });
    });

    it("should return users with the specified firstname filter", (done) => {
      const user = getRandomData(users);
      const firstname = user.firstname;
      const matches = users.filter(user => user.firstname === firstname);

      runTest(async function({ expect }) {
        const result = await db.findMany({ firstname });

        expect(result).to.be.an("object");
        expect(result).to.have.property("total").to.equal(matches.length);
        expect(result).to.have.property("length").to.equal(matches.length);
        expect(result).to.have.property("users").to.be.an("array");

        const fetchedUsers = result.users;

        expect(fetchedUsers).to.be.an("array");
        expect(fetchedUsers.length).to.equal(matches.length);

        assertFetchedUsers(expect, fetchedUsers, "firstname", firstname);
        done();
      });
    });

    it("should return users with the specified lastname filter", (done) => {
      const user = getRandomData(users);
      const lastname = user.lastname;
      const matches = users.filter(user => user.lastname === lastname);

      runTest(async function({ expect }) {
        const result = await db.findMany({ lastname });

        expect(result).to.be.an("object");
        expect(result).to.have.property("total").to.equal(matches.length);
        expect(result).to.have.property("length").to.equal(matches.length);
        expect(result).to.have.property("users").to.be.an("array");

        const fetchedUsers = result.users;

        expect(fetchedUsers).to.be.an("array");
        expect(fetchedUsers.length).to.equal(matches.length);

        assertFetchedUsers(expect, fetchedUsers, "lastname", lastname);
        done();
      });
    });
  });
});
