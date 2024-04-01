/**
 * Create and exort a Dependncy Injection Container
 */

const { createContainer, asClass, asFunction, InjectionMode } = require("awilix");
const config = require("./config");

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

const cacheProvider = ["production", "staging"].includes(config.app.environment)
  ? redisCacheProvider
  : memoryCacheProvider;

const notificationProvider = config.app.environment === "test"
  ? consoleNotificationProvider
  : novuNotificationProvider;


const container = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
});

container.register({
  logger: asFunction(createLogger),
  dataSource: asClass(MongooseStore).inject(() => (config.database.mongodb)),
  redisConnection: asFunction(createRedisConnection).inject(() => config.redis),

  cacheStorageProvider: asFunction(cacheProvider),
  notificationProvider: asFunction(notificationProvider).inject(() => (
    config.notification[config.notification.active])),
  UserRepository: asClass(UserRepository),

  CacheService: asClass(CacheService),
  NotificationService: asClass(NotificationService),
  NonceService: asClass(NonceService),
  UserService: asClass(UserService),

  UserController: asClass(UserController),
});


module.exports = container;
