const serializer = require("../../helpers/serializer");

const { serialize, deserialize } = serializer;


module.exports = createRedisStore;


function createRedisStore({ redisConnection }) {
  const store = redisConnection;

  return {
    driver: "redis",

    async set(key, value, options) {
      const { replace, duration } = options || {};
      const nx = replace ? false : true;

      const storageOptions = {
        // if true, set a key only if it doesn't already exist in the Redis store.
        // if false, replace an a previously existing key.
        NX: nx,
      };

      if(duration) {
        storageOptions.EX = duration; // accepts a value with the cache duration in seconds
      }

      return await store.set(key, serialize(value), storageOptions);
    },

    async get(key) {
      const serialized = await store.get(key);
      return serialized ? deserialize(serialized) : null;
    },

    async unset(key) {
      return await store.del(key);
    },

    async contains(key) {
      //return await store.client.sendCommand(["EXISTS", key]);
      return await store.sendCommand(["EXISTS", key]);
    },

    client() {
      return store;
    },
  };
}
