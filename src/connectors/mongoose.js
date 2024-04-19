const mongoose = require("mongoose");


class MongooseStore {
  #db = null;
  #logger = null;
  #options = null;

  /**
   * @param {Object} options object with properties:
   * @param {String} [options.host]: the db server host
   * @param {Number} [options.port]: the db server port
   * @param {String} [options.username]: the db server username
   * @param {String} [options.password]: the db server user password
   * @param {String} [options.dbName]: the name of the database to connect to
   * @param {String} [options.dsn]: full DSN of the mongodb server
   *   If the [options.dsn] is set, it is used instead
   *   and the other options (except [options.debug]) are ignored.
   *   For this reason, when using the dsn option, also specify the database name
   *   in the DSN string.
   * @param {Boolean} [options.debug] determines whether or not to show debugging output
   * @param {Boolean} [options.exitOnConnectFail] terminate the application if connection to MongoDB fails
   * @param {Object} [options.logger] an object with a `log()` property
   *   for logging messages. If none is supplied, the console is used.
   */
  constructor(options) {
    const {
      dsn      = "",
      host     = "0.0.0.0",
      port     = 27017,
      username = "",
      password = "",
      dbName   = "users",
      debug    = false,
      exitOnConnectFail = false,
    } = options;

    this.#options = { dsn, host, port, username, password, dbName, debug, exitOnConnectFail };
    this.#logger = options.logger; 

    this.connect();
  }

  /**
   * Connect to a MongoDB server instance
   *
   * @return {resource} a (mongoose) connection instance
   */
  async connect() {
    const options = this.#options;
    const { host, port, username, password, dbName, debug, exitOnConnectFail } = options;

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

    if(!this.#logger || typeof this.#logger !== "object" || !("log" in this.#logger)) {
      return;
    }

    if(this.#logger === console) {
      console.log(`Mongoose ${type} log - ${message}}`);
    } else {
      this.#logger.log(type, message);
    }
  }
}

module.exports = MongooseStore;
