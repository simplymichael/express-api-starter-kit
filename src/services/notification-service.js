const util = require("node:util");
const constants = require("../constants");


class NotificationService {
  /**
   * @param {Object} options
   * @param {Object} [options.provider] a provider object that implements
   *   the method
   *    `sendNotificationToUser({ userId, notificationId, templateVariables })`
   */
  constructor({ notificationProvider, logger }) {
    this.provider = notificationProvider;
    this.logger = logger;
  }

  async sendConfirmationLink(user, nonce) {
    const notificationData  = constants.notifications.ACCOUNT_ACTIVATION;
    const notificationId    = notificationData.id;
    const templateVariables = notificationData.templateVars;

    for(const [prop, value] of Object.entries(templateVariables)) {
      templateVariables[prop] = value.replace(":code:", nonce);
    }

    await this.provider.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });

    this.logger.log("info", `Confirmation link sent to user: ${util.inspect(user)}`);
  }

  async sendPasswordResetLink(user, nonce) {
    const notificationData  = constants.notifications.PASSWORD_RESET;
    const notificationId    = notificationData.id;
    const templateVariables = notificationData.templateVars;

    for(const [prop, value] of Object.entries(templateVariables)) {
      templateVariables[prop] = value.replace(":code:", nonce);
    }

    await this.provider.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });

    this.logger.log("info", `Password reset link sent to user: ${util.inspect(user)}`);
  }

  async resendConfirmationLink(user, nonce) {
    const notificationData  = constants.notifications.ACCOUNT_ACTIVATION_EMAIL_RESEND;
    const notificationId    = notificationData.id;
    const templateVariables = {
      ...notificationData.templateVars,
      verificationCode: nonce,
    };

    await this.provider.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });

    this.logger.log("info", `Confirmation link re-sent to user: ${util.inspect(user)}`);
  }
}


module.exports = NotificationService;
