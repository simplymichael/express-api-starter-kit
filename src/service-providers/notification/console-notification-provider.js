module.exports = function consoleNotificationProvider() {
  return {
    sendNotificationToUser,
  };

  async function sendNotificationToUser(options) {
    const { userId, notificationId, templateVariables } = options;
    console.log(`
      Sending notification ${notificationId}
      to user '${userId}'
      with variables '${templateVariables}'
    `);
  }
};
