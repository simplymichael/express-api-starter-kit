const constants = require("../../constants");


class ConsoleNotificationService {
  async sendConfirmationLink(user, nonce) {
    const notificationData  = constants.notifications.ACCOUNT_ACTIVATION;
    const notificationId    = notificationData.id;
    const templateVariables = notificationData.templateVars;

    for(const [prop, value] of Object.entries(templateVariables)) {
      templateVariables[prop] = value.replace(":code:", nonce);
    }

    await this.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });
  }

  async sendPasswordResetLink(user, nonce) {
    const notificationData  = constants.notifications.PASSWORD_RESET;
    const notificationId    = notificationData.id;
    const templateVariables = notificationData.templateVars;

    for(const [prop, value] of Object.entries(templateVariables)) {
      templateVariables[prop] = value.replace(":code:", nonce);
    }

    await this.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });
  }

  async resendConfirmationLink(user, nonce) {
    const notificationData  = constants.notifications.ACCOUNT_ACTIVATION_EMAIL_RESEND;
    const notificationId    = notificationData.id;
    const templateVariables = {
      ...notificationData.templateVars,
      verificationCode: nonce,
    };

    await this.sendNotificationToUser({
      user,
      notificationId,
      templateVariables
    });
  }


  // Private methods 
  async sendNotificationToUser(options) {
    const { userId, notificationId, templateVariables } = options;
    console.log(`
      Sending notification ${notificationId}
      to user '${userId}'
      with variables '${templateVariables}'
    `);
  }
}


module.exports = ConsoleNotificationService;
