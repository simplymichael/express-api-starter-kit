/**
 * @param {Object} with methods: set, get, contains, unset
 */
class CacheService {
  #storageProvider = null;

  constructor({ cacheStorageProvider }) {
    this.#storageProvider = cacheStorageProvider;
  }

  async set(key, value, duration) {
    const options = (this.#storageProvider.driver === "redis" ? { duration } : duration);
    return await this.#storageProvider.set(key, value, options);
  }

  async get(key) {
    return await this.#storageProvider.get(key);
  }

  async contains(key) {
    return await this.#storageProvider.contains(key);
  }

  async unset(key) {
    await this.#storageProvider.unset(key);
  }
}

module.exports = CacheService;
