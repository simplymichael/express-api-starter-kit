const env = require("../dotenv");

const config = {
  novu: {
    apiKey: env.NOVU_API_KEY.trim(),
  },
};

module.exports = config;
