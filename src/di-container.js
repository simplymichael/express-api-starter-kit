/**
 * Create and exort a Dependncy Injection Container
 */

const { createContainer, asClass, asFunction, InjectionMode } = require("awilix");
const env = require("../dotenv");

const createLogger = require("./connectors/logger");
const createRedisConnection = require("./connectors/redis");

const UserController = require("./controllers/user-controller");
const UserRepository = require("./model/user-repository/mongoose");
const MongooseStore = require("./model/data-sources/mongoose-store");

const memoryCacheProvider = require("./service-providers/cache/memory-storage-provider");
const redisCacheProvider = require("./service-providers/cache/redis-storage-provider");
const consoleNotificationProvider = require("./service-providers/notification/console-notification-provider");
const novuNotificationProvider = require("./service-providers/notification/novu-notification-provider");

const CacheService = require("./services/cache-service");
const NonceService = require("./services/nonce-service");
const NotificationService = require("./services/notification-service");
const UserService = require("./services/user-service");

const cacheProvider = ["production", "staging"].includes(env.NODE_ENV.toLowerCase())
  ? redisCacheProvider
  : memoryCacheProvider;

const notificationProvider = env.NODE_ENV.toLowerCase() === "test"
  ? consoleNotificationProvider
  : novuNotificationProvider;


const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

container.register({
  logger: asFunction(createLogger),
  dataSource: asClass(MongooseStore).inject(() => ({
    connectionOptions: {
      dsn      : env.DB_DSN,
      host     : env.DB_HOST,
      port     : env.DB_PORT,
      username : env.DB_USERNAME,
      password : env.DB_PASSWORD,
      dbName   : env.DB_DBNAME,
      exitOnConnectFail: true,
    }
  })),
  redisConnection: asFunction(createRedisConnection).inject(() => ({
    dsn         : env.REDIS_DSN,
    host        : env.REDIS_HOST,
    port        : env.REDIS_PORT,
    username    : env.REDIS_USERNAME,
    password    : env.REDIS_PASSWORD,
    db          : env.REDIS_DATABASE,
    autoConnect : true,
    // logger is auto-resolved and injected, since we have registered it here.
    // logger,
  })),

  cacheStorageProvider: asFunction(cacheProvider),
  notificationProvider: asFunction(notificationProvider).inject(() => ({
    apiKey: env.NOVU_API_KEY.trim(),
  })),
  userRepository: asClass(UserRepository),

  cacheService: asClass(CacheService),
  notificationService: asClass(NotificationService),
  nonceService: asClass(NonceService),
  userService: asClass(UserService),

  userController: asClass(UserController),
});


module.exports = container;
