const redis  = require("redis");

module.exports = createRedisConnection;

/**
 * Connect to a Redis server instance
 *
 * @param {Object} options: connection options
 * @param {String} [options.host]: the server host
 * @param {Number} [options.port]: the server port
 * @param {String} [options.username]: the server username
 * @param {String} [options.password]: the server user password
 * @param {String} [options.db]: the database to connect to
 * @param {String} [options.dsn]: full DSN of the Redis server
 *   If the [options.dsn] is set, it is used instead
 *   and the other optionsare ignored.
 * @param {Boolean} [options.autoConnect]: whether (true) or not (false) to
 *   automatically connect to the Redis server. Default is true.
 * @param {Object} logger with member function log
 * @return {Promise} resolved with the connection on success.
 */
function createRedisConnection(options) {
  const {
    dsn       = "",
    host      = "localhost",
    port      = 6379,
    username  = "",
    password  = "",
    db        = "",
    autoConnect = true,
    logger      = { log: () => {} },
  } = options;

  let connString;
  const driverStr = "redis://";

  if(dsn) {
    connString = dsn;
  } else {
    connString  = driverStr;

    if(username) {
      connString += username.trim();
    }

    if(password) {
      connString += `:${password.trim()}`;
    }

    if(username || password) {
      connString += "@";
    }

    if(host) {
      connString += host.trim();
    }

    if(port) {
      connString += `:${port}`.trim();
    }

    if(db) {
      connString += `/${db}`.trim();
    }
  }

  connString = connString.trim();

  const client = (connString === driverStr
    ? redis.createClient()
    : redis.createClient({ url: connString })
  );

  client.on("connect", function() {
    client.connected = true;
    innerLog({ type: "info", message: "Connected to Redis server!" });
  });

  client.on("connecting", function() {
    innerLog({ type: "info", message: "The Redis client is connecting to the server" });
  });

  client.on("error", function(err) {
    innerLog({ type: "error", message: `Redis client error: ${err}` });
  });

  client.on("ready", function() {
    client.ready = true;
    innerLog({ type: "info", message: "The Redis client is ready to accept requests" });
  });

  if(autoConnect) {
    client.connect();
  }

  function innerLog(data) {
    const { type, message } = data;

    logger.log(type, message);
  }

  return client;
}
