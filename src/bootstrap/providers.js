// List the service providers in the order they should be invoked.
const AppServiceProvider = require("../service-providers/app-service-provider");
const DatabaseServiceProvider = require("../service-providers/database-service-provider");
const NotificationServiceProvider = require("../service-providers/notification-service-provider");

module.exports = [
  AppServiceProvider,
  DatabaseServiceProvider,
  NotificationServiceProvider,
];
