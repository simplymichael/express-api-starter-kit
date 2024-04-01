const diContainer = require("../di-container");


class ServiceProvider {
  constructor() {
    this.container = diContainer;
  }
}

module.exports = ServiceProvider;
