const importNovu = () => import("@novu/node").then(({ Novu }) => Novu);


module.exports = function novuNotificationProvider({ apiKey, logger }) {
  return {
    sendNotificationToUser,
  };

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
  async function sendNotificationToUser(options) {
    const { user, notificationId, templateVariables } = options;
    const novu = await getNovu();

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

      logger.log("info",`Notification "${notificationId}" sent to user: "${user.id}"`);
    } catch(e) {
      logger.log(
        "error",
        `Error sending notification "${notificationId}" to user "${user.id}" because of error: ${e}`
      );
    }
  }

  async function getNovu() {
    const Novu = await importNovu();
    const novu = new Novu(apiKey);

    return novu;
  }
};
