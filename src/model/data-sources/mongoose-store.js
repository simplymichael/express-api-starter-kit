const mongoose = require("mongoose");


class MongooseStore {
  #db = null;

  /**
   *
   * @param {Object} options object with properties:
   * @param {Object} connectionOptions: connection options
   * @param {String} [connectionOptions.host]: the db server host
   * @param {Number} [connectionOptions.port]: the db server port
   * @param {String} [connectionOptions.username]: the db server username
   * @param {String} [connectionOptions.password]: the db server user password
   * @param {String} [connectionOptions.dbName]: the name of the database to connect to
   * @param {String} [connectionOptions.dsn]: full DSN of the mongodb server
   *   If the [connectionOptions.dsn] is set, it is used instead
   *   and the other connectionOptions (except [connectionOptions.debug]) are ignored.
   *   For this reason, when using the dsn option, also specify the database name
   *   in the DSN string.
   * @param {Boolean} [connectionOptions.debug] determines whether or not to show debugging output
   * @param {Boolean} [connectionOptions.exitOnConnectFail] terminate the application if connection to MongoDB fails
   * @param {Object} [connectionOptions.logger] an object with a `log()` property
   *   for logging messages. If none is supplied, the console is used.
   */
  constructor({ connectionOptions, logger }) {
    this.connectionOptions = connectionOptions;
    this.logger = logger;
  }

  /**
   * Connect to a MongoDB server instance
   *
   * @return {resource} a (mongoose) connection instance
   */
  async connect() {
    const options = this.connectionOptions;
    const {
      host = "0.0.0.0",
      port = 27017,
      username = "",
      password = "",
      dbName = "users",
      debug = false,
      exitOnConnectFail = false,
    } = options;

    let dsn;

    if(options.dsn?.trim()?.length > 0) {
      dsn = options.dsn;
    } else {
      dsn = "mongodb://";

      if(username) {
        dsn += username;
      }

      if(password) {
        dsn += `:${password}`;
      }

      dsn += ( (username ? "@" : "") + `${host}:${port}/${dbName}` );
    }

    try {
      mongoose.set("debug", debug);

      this.#db = await mongoose.connect(dsn, {});

      this.log({
        type: "info",
        message: "Successfully connected to MongoDB server"
      });

      return this.#db;
    } catch(err) {
      this.log({
        type: "error",
        message: `Failed to connect to MongoDB server: ${err}`
      });

      if(exitOnConnectFail) {
        process.exit(1);
      }
    }
  }

  async disconnect() {
    await this.#db.disconnect();
    this.log({ type: "info", message: "DB disconnected" });
    this.logger = null;
  }


  // Private helper methods
  /**
   * @param {Object} logData
   * @param {String} [logData.type]: The type of message ("info", "error", "success")
   * @param {String} [logData.message]: The message to log
   * @param {Object} [logData.data]: Any extra data we wish to pass to the logger
   */
  log(logData) {
    let { type, message } = logData;
    const types = ["info", "error", "success"];

    type = type.toLowerCase();
    type = types.includes(type) ? type : "info";

    if(!this.logger || typeof this.logger !== "object" || !("log" in this.logger)) {
      return;
    }

    if(this.logger === console) {
      console.log(`Mongoose ${type} log - ${message}}`);
    } else {
      this.logger.log(type, message);
    }
  }
}

module.exports = MongooseStore;
