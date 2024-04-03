const mongoose = require("mongoose");
const UserSchema = require("./schema");

const User = mongoose.model("User", UserSchema);


// implements (not-yet-defined) interface UserRepository
class MongooseStore {
  #dbConn = null;

  /**
   *
   * @param {Object}
   * @param {Object} [options.mongooseConnection]: a mongoose connection object
   *   with methods: connect() and disconnect()
   */
  constructor({ mongooseConnection }) {
    this.#dbConn = mongooseConnection;
  }

  /**
   * @param object with members:
   *   - firstname {string}
   *   - lastname {string}
   *   - email {string}
   *   - role {string}
   *   - status {string}
   *   - password {string}
   *
   * @return object with members:
   *   - total {number} the total number of users that match the search term
   *   - length {number} the number of results returned for the current page and limit
   *   - users {array} the actual list of returned users that match the search term
   */
  async createUser(userData) {
    const dataSource = this.#dbConn;
    const { firstname, lastname, email, role, status, password } = userData;

    try {
      await dataSource.connect();
      const user = await User.create({
        email,
        role,
        status,
        password,
        name: {
          first: firstname,
          last: lastname
        },
      });

      user.password = "*".repeat(10);

      // No need to await it. Just fire and forget
      // and let it disconnect asynchronously.
      dataSource.disconnect();

      return user;
    } catch(err) {
      if (err.code === 11000) {
        throw {
          type: "USER_EXISTS_ERROR",
          error: err,
        };
      }

      if (err.name === "ValidationError") {
        const validationErrors = Object.keys(err.errors).map((currField) => {
          return {
            value    : currField === "password" ? password : err.errors[currField].value,
            location : "body",
            msg      : err.errors[currField].message,
            field    : currField
          };
        });

        throw {
          type: "VALIDATION_ERROR",
          errors: validationErrors,
        };
      }
    }
  }

  async updateUser(userId, updateData) {
    const name = {};

    if(updateData.firstname) {
      name.first = updateData.firstname;
    }

    if(updateData.lastname) {
      name.last = updateData.lastname;
    }

    if(Object.keys(name).length > 0) {
      updateData.name = name;
    }

    await this.#dbConn.connect();
    const user = await User.updateUser(userId, updateData);
    this.#dbConn.disconnect();

    return user;
  }

  async deleteUser(userId) {
    await this.#dbConn.connect();
    await User.deleteUser(userId);
    this.#dbConn.disconnect();
  }

  /**
   * @param object with members:
   *   - firstname {string} filter by users with matching firstnames (optional)
   *   - lastname {string} get users with matching lastnames (optional)
   *   - page {number} the page to return, for pagination purposes (optional, default 1)
   *   - limit {number} the number of results to return, for pagination purposes (optional, default 20)
   *   - sort {string} determines the sort order of returned users (optional)
   *
   * @return object with members:
   *   - total {number} the total number of users that match the specified firstname and/or lastname filters
   *   - length {number} the number of results returned for the current page and limit
   *   - users {array} the actual list of returned users that match the search term
   */
  async findMany(options) {
    const dataSource = this.#dbConn;

    options = options || {};
    let {
      firstname = "",
      lastname = "",
      page = 1,
      limit = 20,
      sort = ""
    } = options;

    firstname = (typeof firstname === "string" ? firstname : "").trim();
    lastname = (typeof lastname === "string" ? lastname : "").trim();
    sort = (typeof sort === "string" ? sort : "").trim();

    let where = {};
    const searchBy = [];
    const firstnameRegex = new RegExp(firstname, "i");
    const lastnameRegex = new RegExp(lastname, "i");

    if(firstname.length > 0 && lastname.length > 0) {
      searchBy.push({ "name.first": firstnameRegex });
      searchBy.push({ "name.last": lastnameRegex });
    } else if(firstname.length > 0) {
      searchBy.push({ "name.first": firstnameRegex });
    } else if(lastname.length > 0) {
      searchBy.push({ "name.last": lastnameRegex });
    }

    if(searchBy.length > 0) {
      where = searchBy.length === 1 ? searchBy[0] : { "$or": searchBy };
    }

    await dataSource.connect();
    const orderBy = MongooseStore.generateOrderBy(sort);
    const queryParams = { where, page, limit, orderBy };
    const allUsersCount = await User.countUsers(where);
    const results = await User.generateQuery(queryParams).exec();

    dataSource.disconnect();

    return {
      total: allUsersCount,
      length: results.length,
      users: results,
    };
  }

  /**
   * @param object with members:
   *   - query {string} the search term (required)
   *   - by {string} whether to search by firstname, lastname, email (optional, default searches by all)
   *   - page {number} the page to return, for pagination purposes (optional, default 1)
   *   - limit {number} the number of results to return, for pagination purposes (optional, default 20)
   *   - sort {string} determines the sort order of returned users (optional)
   *
   * @return object with members:
   *   - total {number} the total number of users that match the search term
   *   - length {number} the number of results returned for the current page and limit
   *   - users {array} the actual list of returned users that match the search term
   */
  async search(options) {
    options = options || {};
    const dataSource = this.#dbConn();
    let { query, by = "", page = 1, limit = 20, sort = ""} = options;
    by = (typeof by === "string" ? by : "").trim();
    sort = (typeof sort === "string" ? sort : "").trim();
    query = (typeof query === "string" ? query : "").trim();

    if(!query || query.length === 0) {
      throw new Error("Please specify the search term");
    }

    const orderBy = MongooseStore.generateOrderBy(sort);
    const regex = new RegExp(query, "i");
    const queryParams = { by, page, limit, orderBy };

    // Prepare the searchBy clause
    let searchBy = [];

    //?by=firstname:lastname:email
    if(by && by.length > 0) {
      const byData = by.split(":");

      byData.forEach(key => {
        key = key.trim();

        if(key) {
          switch(key.toLowerCase()) {
          case "firstname" : searchBy.push({ "name.first": regex }); break;
          case "lastname"  : searchBy.push({ "name.last": regex }); break;
          default          : searchBy.push({ [key]: regex }); break;
          }
        }
      });
    } else {
      searchBy = [
        { email: regex },
        { "name.first": regex },
        { "name.last": regex }
      ];
    }


    const where = searchBy.length === 1 ? searchBy[0] : { "$or": searchBy };

    await dataSource.connect();
    const allUsersCount = await User.countUsers(where);
    const results = await User.generateSearchQuery(query, queryParams).exec();

    dataSource.disconnect();

    return{
      total: allUsersCount,
      length: results.length,
      users: results,
    };
  }

  /**
   * @return user object
   */
  async findOneByEmail(email) {
    await this.#dbConn.connect();
    const user = (await User.generateQuery({ where: {email} }).exec())[0];
    this.#dbConn.disconnect();

    return user;
  }

  async findOneById(userId) {
    await this.#dbConn.connect();
    const user = await User.getById(userId);
    this.#dbConn.disconnect();

    return user;
  }

  static generateOrderBy(sort) {
    // Prepare the orderBy clause
    let orderBy = {};

    //?sort=firstname:desc=lastname=email:asc
    if(sort && sort.length > 0) {
      const sortData = sort.split("=");

      orderBy = sortData.reduce((acc, val) => {
        const data = val.split(":");
        let orderKey = data[0].toLowerCase();

        if(orderKey === "firstname" || orderKey === "lastname") {
          orderKey = (orderKey === "firstname" ? "name.first" : "name.last");
        }

        acc[orderKey] = ((data.length > 1) ? data[1] : "");

        return acc;
      }, {});
    }

    return orderBy;
  }
}

module.exports = MongooseStore;
