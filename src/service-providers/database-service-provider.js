const config = require("../config");
const UserController = require("../controllers/user-controller");
const mongooseConnection = require("../connectors/mongoose");
const UserRepository = require("../repositories/user-repository");
const mongooseStore = require("../repositories/user-repository/data-sources/mongoose");
const UserService = require("../services/user-service");

const ServiceProvider = require("./service-provider");



class DatabaseServiceProvider extends ServiceProvider {
  constructor() {
    super();
  }

  register() {
    const container = this.container;

    this.container.bindWithClass(
      "mongooseConnection", 
      mongooseConnection, 
      config.database.mongodb
    );
    this.container.bindWithClass("mongooseStore", mongooseStore);
    this.container.bindWithClass("userRepository", UserRepository, {
      dataSource: container.resolve("mongooseStore"),
    });
    this.container.bindWithClass("userService", UserService);
    this.container.bindWithClass("userController", UserController);
  }
}

module.exports = DatabaseServiceProvider;
