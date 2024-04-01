const config = require("../config");
const NovuNotification = require("../services/notification/novu");
const ConsoleNotification = require("../services/notification/console");
const ServiceProvider = require("./service-provider");

const NotificationService = config.environment === "test"
  ? ConsoleNotification
  : NovuNotification;


class NotificationServiceProvider extends ServiceProvider {
  constructor() {
    super();
  }

  register() {
    this.container.bindWithClass("NotificationService", NotificationService);
  }
}

module.exports = NotificationServiceProvider;
