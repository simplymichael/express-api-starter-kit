const env = require("../dotenv");

const config = {
  notification: {
    active: "novu",
    novu: {
      apiKey: env.NOVU_API_KEY.trim(),
    }
  },
};

module.exports = config;
