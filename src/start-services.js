module.exports = function startServices(app) {
  const config = app.resolve("appConfig");
  
  // Resolve the mongoose connection
  // so that it initializes and calls the connect() method
  app.resolve("mongooseConnection");
  
  if(config.initRedis) {
    // Resolve the Redis connection
    // so that it initializes and call the connect() mehtod
    app.resolve("redisConnection");
  }
};