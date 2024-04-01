const config = require("../config");
const UserController = require("../controllers/user-controller");
const MongooseStore = require("../model/mongoose");
const UserRepository = require("../repositories/user-repository/mongoose");
const UserService = require("../services/user-service");

const ServiceProvider = require("./service-provider");



class DatabaseServiceProvider extends ServiceProvider {
  constructor() {
    super();
  }

  register() {
    this.container.bindWithClass("MongooseStore", MongooseStore, config.database.mongodb);
    this.container.bindWithClass("UserRepository", UserRepository);
    this.container.bindWithClass("UserService", UserService);
    this.container.bindWithClass("UserController", UserController);
  }
}

module.exports = DatabaseServiceProvider;
