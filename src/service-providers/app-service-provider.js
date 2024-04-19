const config = require("../config");
const createRedisConnection = require("../connectors/redis");
const memoryCache = require("../services/cache/memory-cache");
const redisCache = require("../services/cache/redis-cache");
const winstonLogger = require("../services/log/winston-logger");
const NonceService = require("../services/nonce-service");
const ServiceProvider = require("./service-provider");


const connectToRedis = ["production", "staging"].includes(config.app.environment);
const cache = connectToRedis ? redisCache : memoryCache;


class AppServiceProvider extends ServiceProvider {
  constructor() {
    super();
  }

  register() {
    this.container.bindWithFunction("appConfig", function configGetter() {
      return deepFreezeObject({ ...config, initRedis: connectToRedis });
    });

    this.container.bindWithFunction("logger", winstonLogger);

    if(connectToRedis) {
      this.container.bindWithFunction("redisConnection", createRedisConnection, config.redis);
    }

    if(cache === redisCache) {
      this.container.bindWithFunction("cacheService", cache, this.container.resolve("redisConnection"));
    } else {
      this.container.bindWithFunction("cacheService", cache);
    }

    this.container.bindWithClass("nonceService", NonceService);
  }
}

module.exports = AppServiceProvider;


// Helper functions

// Credits.
// - https://stackoverflow.com/a/34776962/1743192
// - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze#freezing_arrays
function deepFreezeObject(o) {
  Object.freeze(o);

  if(o === null) {
    return o;
  }

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if(o[prop] && (typeof o[prop] === "object" || typeof o[prop] === "function")
      && !Object.isFrozen(o[prop])) {
      deepFreezeObject(o[prop]);
    }
  });

  return o;
}
