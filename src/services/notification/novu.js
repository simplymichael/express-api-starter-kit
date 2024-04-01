const util = require("node:util");
const importNovu = () => import("@novu/node").then(({ Novu }) => Novu);
const config = require("../../config");
const constants = require("../../constants");


class NovuNotificationService {
  #logger = null;

  /**
   * @param {Object} options
   */
  constructor({ logger }) {
    this.#logger = logger;
  }

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

    this.#logger.log("info", `Confirmation link sent to user: ${util.inspect(user)}`);
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

    this.#logger.log("info", `Password reset link sent to user: ${util.inspect(user)}`);
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

    this.#logger.log("info", `Confirmation link re-sent to user: ${util.inspect(user)}`);
  }


  // Private methods 
  /**
   * Send a notification to a single individual
   * @param {Object} options: configuration options
   * @param {Object} [options.user]: The user to send notification to
   * @param {string} [options.notificationId]: The novu trigger ID
   * @param {Object} [options.templateVariables]: Object encapsulating the values of
   *    template placeholders on the notification created on novu.
   *    The object can contain nested objects. For example:
   *    tplVariables = {
   *      organization: {
   *        logo: 'https://evilcorp.com/logo.png',
   *     },
   *   }
   */
  async sendNotificationToUser(options) {
    const { user, notificationId, templateVariables } = options;
    const novu = await this.getNovu();

    try {
      if(!user) {
        return;
      }

      // Create a subscriber (Add the user as a subscriber)
      // https://docs.novu.co/quickstarts/nodejs#create-a-subscriber
      await novu.subscribers.identify(user.id);

      // Send the notification
      // https://docs.novu.co/sdks/nodejs#usage
      await novu.trigger(notificationId, {
        to: {
          subscriberId : user.id,
          email        : user.email,
          firstName    : user.firstname,
          lastName     : user.lastname,
        },
        payload: {
          ...templateVariables,
          firstName: user.firstname,
          lastName: user.lastname,
        }
      });

      this.#logger.log("info",`Notification "${notificationId}" sent to user: "${user.id}"`);
    } catch(e) {
      this.#logger.log(
        "error",
        `Error sending notification "${notificationId}" to user "${user.id}" because of error: ${e}`
      );
    }
  }

  async getNovu() {
    const Novu = await importNovu();
    const novu = new Novu(config.novu.apiKey);

    return novu;
  }
}


module.exports = NovuNotificationService;
