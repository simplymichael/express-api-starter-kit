const config = require("../config");
const createRedisConnection = require("../connectors/redis");
const memoryCache = require("../services/cache/memory-cache");
const redisCache = require("../services/cache/redis-cache");
const winstonLogger = require("../services/log/winston-logger");
const NonceService = require("../services/nonce-service");
const ServiceProvider = require("./service-provider");


const connectToRedis = ["production", "staging"].includes(config.environment);
const cache = connectToRedis ? redisCache : memoryCache;


class AppServiceProvider extends ServiceProvider {
  constructor() {
    super();
  }

  register() {
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
