const crypto = require("crypto");


class NonceService {
  #cacheService = null;

  constructor({ cacheService }) {
    this.#cacheService = cacheService;
  }

  /**
   * @param void
   * @return {String}: the generated nonce, which we can pass to
   *   - bindNonce() along with some data to bind the nonce to that data.
   *   - validateNonce(): to retrieve the associated data
   *        if any exists and has not expired
   */
  async createNonce() {
    const nonce = crypto.randomUUID();

    return nonce;
  }

  /**
   * @param {String} nonce: the nonce, created with createNonce(), to bind to a user
   * @param {Mixed} data: the data to associated with the nonce
   * @param {Number} duration: how long the data should last for before being purged
   * @return void
   */
  async bindNonce(nonce, data, duration) {
    await this.#cacheService.set(nonce, data, duration);
  }

  /**
   * @param {String} nonce: Previously stored nonce
   * @return {Object} the data associated with the nonce.
   */
  async validateNonce(nonce) {
    if(!nonce) {
      return nonce;
    }

    const json = await this.#cacheService.get(nonce);

    return json;
  }

  /**
   * Delete a previously stored nonce
   * @param {String} nonce: Previously stored nonce
   * @return void
   */
  async deleteNonce(nonce) {
    await this.#cacheService.unset(nonce);
  }
}


module.exports = NonceService;
